import { useEffect } from 'react';

function ConfirmModal({ titulo, mensagem, onConfirmar, onCancelar, corBotao = 'danger' }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-body p-4 text-center">
            <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '70px', height: '70px',
                background: corBotao === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'
              }}>
              <i className="bi bi-exclamation-triangle-fill"
                style={{ fontSize: '2rem', color: corBotao === 'danger' ? '#ef4444' : '#f59e0b' }}></i>
            </div>
            <h5 className="fw-bold mb-2">{titulo}</h5>
            <p className="text-muted mb-4">{mensagem}</p>
            <div className="d-flex gap-3 justify-content-center">
              <button className="btn btn-outline-secondary px-4" style={{ borderRadius: '10px' }} onClick={onCancelar}>
                Cancelar
              </button>
              <button
                className={`btn btn-${corBotao} px-4`}
                style={{ borderRadius: '10px', fontWeight: '600' }}
                onClick={onConfirmar}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
