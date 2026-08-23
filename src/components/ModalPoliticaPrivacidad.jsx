import React, { useEffect } from 'react';

export default function ModalPoliticaPrivacidad({ isOpen, onClose }) {
  // Manejo de la tecla ESC para cerrar el modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div 
      className="ds-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-politica-privacidad"
    >
      <div 
        className="ds-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="ds-modal-header">
          <div>
            <h3 id="titulo-politica-privacidad" className="ds-modal-title">
              📋 Política de Tratamiento de Datos Personales
            </h3>
            <span className="ds-badge-ley">Ley N° 21.719 de Protección de Datos Personales</span>
          </div>
          <button 
            type="button" 
            className="ds-modal-close-btn" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>

        {/* Cuerpo del Modal con scroll interno */}
        <div className="ds-modal-body">
          <p className="ds-legal-intro">
            La presente Política de Tratamiento de Datos Personales regula la recopilación, almacenamiento, uso y protección de la información personal de los usuarios en la Plataforma de Juntas de Vecinos, de conformidad con lo establecido en la <strong>Ley N° 21.719 sobre Protección de Datos Personales en Chile</strong>.
          </p>

          <section className="ds-legal-section">
            <h4>1. Responsable del Tratamiento de Datos</h4>
            <p>
              El tratamiento de los datos personales es realizado de forma conjunta por la administración de la plataforma SaaS y la respectiva <strong>Junta de Vecinos</strong> ante la cual el usuario solicita trámites o certificados de residencia.
            </p>
          </section>

          <section className="ds-legal-section">
            <h4>2. Datos Personales Recopilados</h4>
            <p>Para la correcta prestación del servicio y emisión de certificados, la plataforma recopila los siguientes datos:</p>
            <ul>
              <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, Rol Único Tributario (RUT), correo electrónico y teléfono.</li>
              <li><strong>Datos de Residencia:</strong> Dirección particular, comuna, calidad de residente (propietario/arrendatario/familiar) y documentos acreditativos (boletas de servicios básicos, contratos de arriendo o certificados de residencia previos).</li>
              <li><strong>Documentos Adjuntos:</strong> Copia o fotografía digital de la Cédula de Identidad por ambos lados (utilizada exclusivamente para la validación de identidad).</li>
            </ul>
          </section>

          <section className="ds-legal-section">
            <h4>3. Finalidad del Tratamiento de Datos</h4>
            <p>Los datos suministrados por los vecinos serán utilizados única y exclusivamente para:</p>
            <ul>
              <li>Gestionar la creación y autenticación de la cuenta de usuario en el portal.</li>
              <li>Verificar la identidad del solicitante y la veracidad de su residencia dentro de la jurisdicción de la Junta de Vecinos.</li>
              <li>Emitir Certificados de Residencia y llevar el registro de acreditación exigido por la normativa local y municipal.</li>
              <li>Enviar notificaciones sobre el estado de las solicitudes o avisos comunitarios relevantes.</li>
            </ul>
          </section>

          <section className="ds-legal-section">
            <h4>4. Consentimiento Inequívoco y Expreso (Art. 12°)</h4>
            <p>
              Al marcar la casilla de verificación correspondiente en el registro o al enviar un formulario de solicitud, el usuario otorga su <strong>consentimiento libre, informado, explícito e inequívoco</strong> para que sus datos sean tratados conforme a las finalidades descritas en este documento.
            </p>
          </section>

          <section className="ds-legal-section">
            <h4>5. Derechos ARCO del Titular</h4>
            <p>
              Conforme a la Ley N° 21.719, el titular de los datos personales puede ejercer en cualquier momento sus derechos de:
            </p>
            <ul>
              <li><strong>Acceso:</strong> Solicitar información sobre qué datos personales suyos están siendo tratados.</li>
              <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos, desactualizados o incompletos.</li>
              <li><strong>Cancelación / Supresión:</strong> Solicitar la eliminación de sus datos personales cuando ya no sean necesarios para la finalidad informada.</li>
              <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos por motivos legítimos y específicos.</li>
              <li><strong>Portabilidad:</strong> Solicitar una copia de sus datos en formato estructurado e interoperable.</li>
            </ul>
          </section>

          <section className="ds-legal-section">
            <h4>6. Seguridad y Conservación de la Información</h4>
            <p>
              La plataforma aplica medidas de seguridad técnicas y organizativas para proteger los datos personales contra accesos no autorizados, pérdida o alteración. Los documentos adjuntos serán conservados únicamente durante el tiempo estrictamente necesario para la evaluación y auditoría de los certificados emitidos.
            </p>
          </section>
        </div>

        {/* Pie del Modal */}
        <div className="ds-modal-footer">
          <button 
            type="button" 
            className="ds-btn-secondary"
            onClick={handleImprimir}
          >
            🖨️ Imprimir / Guardar en PDF
          </button>
          <button 
            type="button" 
            className="ds-btn-primary" 
            onClick={onClose}
          >
            Entendido y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
