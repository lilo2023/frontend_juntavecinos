import { juntasDeVecinosNunoa } from './juntasData.js';
import { nunoaPolygons, isPointInPolygon } from './nunoaPolygonsData.js';

/**
 * Normaliza el nombre de la calle para comparaciones robustas
 */
function normalizarCalle(calle) {
    if (!calle) return '';
    return calle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
        .replace(/^(avenida|avda\.?|av\.?|calle|pasaje|pje\.?)\s+/i, '')
        .trim();
}

/**
 * Extrae el nombre de la calle y el número entero de una cadena de dirección
 */
export function extraerCalleYNumero(direccionTexto) {
    if (!direccionTexto) return { calle: '', numero: null, esPar: null };

    // Si viene como objeto
    if (typeof direccionTexto === 'object') {
        const calle = normalizarCalle(direccionTexto.calle || '');
        const num = parseInt(direccionTexto.numero, 10);
        return {
            calle,
            numero: isNaN(num) ? null : num,
            esPar: isNaN(num) ? null : num % 2 === 0
        };
    }

    let str = String(direccionTexto).trim();
    
    // Quitar comuna o país
    str = str.replace(/,\s*(ñuñoa|nunoa|santiago|chile).*$/i, '');
    
    // Quitar departamento, torre, block, piso
    str = str.replace(/\b(depto|departamento|dpto|dp|torre|block|piso|oficina|of)\b\.?\s*\w*/gi, '');

    // Buscar calle y número principal
    const match = str.match(/^(.*?)\s+(\d+)/);
    if (match) {
        const calle = normalizarCalle(match[1]);
        const num = parseInt(match[2], 10);
        return {
            calle,
            numero: isNaN(num) ? null : num,
            esPar: isNaN(num) ? null : num % 2 === 0
        };
    }

    return {
        calle: normalizarCalle(str),
        numero: null,
        esPar: null
    };
}

/**
 * Matriz de Tramos y Paridad para grandes avenidas limítrofes de Ñuñoa.
 * Resuelve de forma determinística y exacta la Junta de Vecinos correspondiente,
 * distinguiendo vereda norte (par) y vereda sur (impar) en avenidas frontera.
 */
export function resolverJuntaPorArteria(direccionTexto) {
    const { calle, numero, esPar } = extraerCalleYNumero(direccionTexto);
    if (!calle || numero === null) return null;

    // ==========================================
    // 1. AVENIDA IRARRÁZAVAL (Límite eje central comunal)
    // Sentido Poniente -> Oriente:
    // Vereda NORTE: PAR (Acera izquierda al oriente)
    // Vereda SUR: IMPAR (Acera derecha al oriente)
    // ==========================================
    if (calle.includes('irarrazaval') || calle.includes('irarrazabal')) {
        let juntaId = null;
        let veredaInfo = esPar ? 'Vereda Norte (Par)' : 'Vereda Sur (Impar)';

        if (numero <= 1400) {
            // Poniente: Salvador / Barrio Italia
            juntaId = esPar ? 'jjvv11' : 'jjvv12'; // 11- Condell vs 12- Javiera Carrera
        } else if (numero <= 2550) {
            // Centro-Poniente: Infante / Sucre
            juntaId = esPar ? 'jjvv10' : 'jjvv9';  // 10- Washington Espejo vs 9- General Sucre 2
        } else if (numero <= 3800) {
            // Centro: Antonio Varas a Chile España / Pedro de Valdivia
            juntaId = esPar ? 'jjvv8' : 'jjvv16';  // 8- Irarrázaval vs 16- Los Tres Antonios
        } else if (numero <= 4400) {
            // Centro-Oriente: Plaza Ñuñoa / Gorostiaga
            juntaId = esPar ? 'jjvv6' : 'jjvv7_18'; // 6- Parque Gorostiaga vs 7 y 18- Consistorial y Plaza Ñuñoa Sur
        } else {
            // Oriente: Ramón Cruz / Américo Vespucio
            juntaId = esPar ? 'jjvv4' : 'jjvv21';  // 4- Parque Pucará vs 21- Parque Ramón Cruz
        }

        const juntaObj = juntasDeVecinosNunoa.find(j => j.id === juntaId);
        if (juntaObj) {
            return {
                junta: juntaObj,
                juntaSugerida: juntaObj,
                metodo: 'arteria_paridad',
                arteria: 'Av. Irarrázaval',
                numero,
                esPar,
                veredaInfo,
                detalle: `Av. Irarrázaval ${numero} (${veredaInfo}) corresponde a la ${juntaObj.name}.`,
                lat: juntaObj.lat,
                lng: juntaObj.lng
            };
        }
    }

    // ==========================================
    // 2. AVENIDA GRECIA (Eje troncal sur de Ñuñoa)
    // Atraviesa desde poniente a oriente
    // ==========================================
    if (calle.includes('grecia')) {
        let juntaId = null;
        let tramoInfo = '';

        if (numero <= 1800) {
            juntaId = 'jjvv13'; // 13- Suárez Mujica
            tramoInfo = 'Sector Poniente (Bustamante / Empart / Suárez Mujica)';
        } else if (numero <= 3800) {
            juntaId = 'jjvv19'; // 19- Universidad (ej. Grecia 3348)
            tramoInfo = 'Sector Centro (Estadio Nacional / Universidad)';
        } else if (numero <= 4500) {
            juntaId = 'jjvv27'; // 27- Villa Los Alerces
            tramoInfo = 'Sector Centro-Oriente (Villa Los Alerces / Juan XXIII)';
        } else {
            juntaId = 'jjvv24'; // 24- Villa Los Jardines (ej. Grecia 5500)
            tramoInfo = 'Sector Oriente (Jorge Monckeberg / Villa Los Jardines / Metro Grecia)';
        }

        const juntaObj = juntasDeVecinosNunoa.find(j => j.id === juntaId);
        if (juntaObj) {
            return {
                junta: juntaObj,
                juntaSugerida: juntaObj,
                metodo: 'arteria_tramo',
                arteria: 'Av. Grecia',
                numero,
                esPar,
                tramoInfo,
                detalle: `Av. Grecia ${numero} (${tramoInfo}) corresponde a la ${juntaObj.name}.`,
                lat: juntaObj.lat,
                lng: juntaObj.lng
            };
        }
    }

    // ==========================================
    // 3. AVENIDA JOSÉ PEDRO ALESSANDRI / MACUL
    // ==========================================
    if (calle.includes('alessandri') || calle.includes('macul')) {
        let juntaId = null;
        if (numero <= 1800) {
            juntaId = 'jjvv19'; // 19- Universidad
        } else {
            juntaId = 'jjvv28'; // 28- José Pedro Alessandri
        }
        const juntaObj = juntasDeVecinosNunoa.find(j => j.id === juntaId);
        if (juntaObj) {
            return {
                junta: juntaObj,
                juntaSugerida: juntaObj,
                metodo: 'arteria_tramo',
                arteria: 'Av. José Pedro Alessandri',
                numero,
                esPar,
                detalle: `Av. José Pedro Alessandri ${numero} corresponde a la ${juntaObj.name}.`,
                lat: juntaObj.lat,
                lng: juntaObj.lng
            };
        }
    }

    return null;
}

/**
 * Aplica ajuste de paridad en coordenadas geográficas para evitar que puntos
 * sobre el eje de la calle caigan en el lado opuesto por imprecisión del GPS o mapa.
 */
export function aplicarOffsetParidad(lat, lng, direccionTexto) {
    const { calle, esPar } = extraerCalleYNumero(direccionTexto);
    if (!calle || esPar === null) return { lat, lng };

    // Si es Av. Irarrázaval (calle este-oeste donde el norte es Par y el sur es Impar)
    if (calle.includes('irarrazaval') || calle.includes('irarrazabal')) {
        // En Santiago (Hemisferio Sur), sumar latitud desplaza hacia el NORTE, restar hacia el SUR
        const deltaLat = esPar ? +0.0003 : -0.0003; // ~30 metros perpendicular al eje
        return {
            lat: lat + deltaLat,
            lng
        };
    }

    return { lat, lng };
}

/**
 * Resolución completa integrada:
 * 1. Prueba coincidencia por arteria y paridad (exacta y determinística).
 * 2. Si no aplica, usa coordenadas ajustadas y evalúa el polígono municipal (Point-in-Polygon).
 * 3. Si no cae en polígono, busca la sede de JJVV más cercana (Haversine).
 */
export function resolverJuntaCompleta(direccionTexto, lat, lng) {
    // 1. Matriz de arterias críticas
    const resolucionArteria = resolverJuntaPorArteria(direccionTexto);
    if (resolucionArteria) {
        return {
            juntaSugerida: resolucionArteria.junta,
            metodo: resolucionArteria.metodo,
            detalle: resolucionArteria.detalle,
            distanciaSugerida: 0
        };
    }

    // 2. Si tenemos coordenadas, aplicar offset de paridad y evaluar polígono
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
        const { lat: latAjustada, lng: lngAjustada } = aplicarOffsetParidad(lat, lng, direccionTexto);

        for (const polyObj of nunoaPolygons) {
            if (polyObj.idJunta && isPointInPolygon(latAjustada, lngAjustada, polyObj.polygon)) {
                const jvvObj = juntasDeVecinosNunoa.find(j => j.id === polyObj.idJunta);
                if (jvvObj) {
                    return {
                        juntaSugerida: jvvObj,
                        metodo: 'poligono_oficial',
                        detalle: `Coordenada dentro del polígono oficial: ${polyObj.name} (${jvvObj.name}).`,
                        distanciaSugerida: 0
                    };
                }
            }
        }
    }

    return null;
}
