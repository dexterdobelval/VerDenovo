import { useState, useRef, useEffect, useCallback } from 'react';

function FAQ() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Olá! Sou o VerX, assistente virtual do VerDenovo. Digite o número da opção desejada:',
      time: new Date().toLocaleTimeString()
    },
    {
      type: 'bot',
      text: '1 - O que podemos reciclar?\n2 - Como separar materiais para coleta?\n3 - O que é um EcoPonto?\n4 - Posso reciclar embalagens sujas?\n5 - O que fazer com pilhas e baterias?\n6 - Como descartar óleo de cozinha?\n7 - Outro...\n0 - Ver menu novamente',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const respostas = {
    '1': 'Podemos reciclar diversos materiais como papel (jornais, revistas, caixas), plástico (garrafas PET, embalagens), vidro (garrafas, potes), metal (latas de alumínio, tampas) e eletrônicos. É importante que os materiais estejam limpos e separados adequadamente.',
    '2': 'A separação deve seguir o sistema de cores: azul para papel, vermelho para plástico, verde para vidro e amarelo para metal. Lave bem as embalagens, retire tampas e rótulos quando possível, e mantenha os materiais secos.',
    '3': 'Um EcoPonto é um local de coleta seletiva onde você pode descartar materiais recicláveis de forma adequada. Estes pontos são estrategicamente localizados em bairros, escolas, empresas e centros comerciais para facilitar o acesso da população.',
    '4': 'Não, embalagens sujas não devem ser colocadas na reciclagem. Restos de comida, óleo ou outros contaminantes podem prejudicar todo o processo de reciclagem. Sempre lave as embalagens com água antes de descartá-las.',
    '5': 'Pilhas e baterias contêm metais pesados tóxicos e nunca devem ser descartadas no lixo comum. Procure pontos de coleta específicos em lojas de eletrônicos, supermercados ou postos de coleta especializados.',
    '6': 'O óleo de cozinha usado deve ser armazenado em recipientes fechados (como garrafas PET) e levado a pontos de coleta específicos. Nunca despeje óleo no ralo ou vaso sanitário, pois isso causa entupimentos e poluição da água.',
    '7': 'Para outras dúvidas, entre em contato conosco pelo email: contato@verdenovo.com.br\n\nNossa equipe responderá sua pergunta o mais breve possível!'
  };

  const menuOpcoes = [
    { num: '1', label: 'O que podemos reciclar?' },
    { num: '2', label: 'Como separar materiais?' },
    { num: '3', label: 'O que é um EcoPonto?' },
    { num: '4', label: 'Reciclar embalagens sujas?' },
    { num: '5', label: 'Pilhas e baterias?' },
    { num: '6', label: 'Descartar óleo de cozinha?' },
    { num: '7', label: 'Outra dúvida' },
  ];

  useEffect(() => {
    setTimeout(() => { window.scrollTo(0, 0); }, 100);
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isInitialLoad]);

  const handleSendMessage = (valor) => {
    const texto = valor ?? inputValue;
    if (!texto.trim()) return;

    setMessages(prev => [...prev, { type: 'user', text: texto, time: new Date().toLocaleTimeString() }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let resposta;
      if (respostas[texto]) {
        resposta = respostas[texto];
      } else if (texto === '0') {
        resposta = '1 - O que podemos reciclar?\n2 - Como separar materiais para coleta?\n3 - O que é um EcoPonto?\n4 - Posso reciclar embalagens sujas?\n5 - O que fazer com pilhas e baterias?\n6 - Como descartar óleo de cozinha?\n7 - Outro...\n0 - Ver menu novamente';
      } else {
        resposta = 'Opção inválida. Digite um número de 1 a 7 ou 0 para ver o menu.';
      }
      setMessages(prev => [...prev, { type: 'bot', text: resposta, time: new Date().toLocaleTimeString() }]);
    }, 800);
  };

  const handleMouseEnterBtn = useCallback((e) => {
    e.currentTarget.style.background = 'rgba(5,150,105,0.12)';
    e.currentTarget.style.transform = 'translateX(4px)';
  }, []);

  const handleMouseLeaveBtn = useCallback((e) => {
    e.currentTarget.style.background = 'rgba(5,150,105,0.05)';
    e.currentTarget.style.transform = 'translateX(0)';
  }, []);

  const handleMouseEnterSend = useCallback((e) => {
    e.currentTarget.style.transform = 'scale(1.05)';
  }, []);

  const handleMouseLeaveSend = useCallback((e) => {
    e.currentTarget.style.transform = 'scale(1)';
  }, []);

  const handleInputFocus = useCallback((e) => {
    e.target.style.borderColor = '#059669';
  }, []);

  const handleInputBlur = useCallback((e) => {
    e.target.style.borderColor = 'rgba(5,150,105,0.2)';
  }, []);

  return (
    <div className="page-content" style={{ paddingBottom: '2rem' }}>
      {/* Hero */}
      <div className="clay education-hero mb-5 animate-fadeInUp" style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.7)', position: 'relative', overflow: 'hidden' }}>
        <div className="animate-float" style={{ position: 'absolute', top: '15%', right: '10%', width: '80px', height: '80px', background: 'rgba(74,222,128,0.2)', borderRadius: '50%', border: '2px solid rgba(74,222,128,0.3)' }}></div>
        <div className="animate-float animate-delay-2" style={{ position: 'absolute', bottom: '20%', left: '5%', width: '60px', height: '60px', background: 'rgba(34,197,94,0.15)', borderRadius: '50%' }}></div>
        <div className="text-center position-relative" style={{ zIndex: 2 }}>
          <div className="d-inline-flex align-items-center px-4 py-2 rounded-pill mb-4 animate-fadeInUp"
            style={{ background: 'rgba(74,222,128,0.2)', border: '2px solid rgba(74,222,128,0.4)', boxShadow: '3px 3px 0px rgba(0,0,0,0.08)', fontSize: '0.9rem', fontWeight: 700, color: '#166534' }}>
            <i className="bi bi-robot me-2"></i>Assistente Virtual
          </div>
          <h1 className="animate-fadeInUp animate-delay-1" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, color: '#14532d', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            VerX — <span style={{ color: '#16a34a' }}>Tire suas Dúvidas</span>
          </h1>
          <p className="animate-fadeInUp animate-delay-2" style={{ fontSize: '1.05rem', color: '#3d5a3d', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            Converse com nosso assistente e aprenda sobre reciclagem e descarte correto
          </p>
        </div>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Atalhos */}
        <div className="col-lg-4">
          <div className="clay h-100" style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.75)' }}>
            <div className="p-4" style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', borderRadius: '22px 22px 0 0', borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px' }}>
                  <i className="bi bi-grid-3x3-gap text-white" style={{ fontSize: '1.3rem' }}></i>
                </div>
                <div>
                  <h5 className="text-white fw-bold mb-0">Atalhos Rápidos</h5>
                  <small style={{ color: 'rgba(255,255,255,0.75)' }}>Clique para perguntar</small>
                </div>
              </div>
            </div>
            <div className="p-4">
              {menuOpcoes.map((op) => (
                <button key={op.num} onClick={() => handleSendMessage(op.num)}
                  className="w-100 text-start mb-2 d-flex align-items-center gap-3"
                  style={{ background: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.25)', borderRadius: '14px', padding: '0.75rem 1rem', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '2px 2px 0px rgba(0,0,0,0.07)' }}
                  onMouseEnter={handleMouseEnterBtn}
                  onMouseLeave={handleMouseLeaveBtn}>
                  <span className="d-flex align-items-center justify-content-center fw-bold" style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', borderRadius: '8px', color: 'white', fontSize: '0.8rem', flexShrink: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.12)' }}>
                    {op.num}
                  </span>
                  <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '500' }}>{op.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="col-lg-8">
          <div className="clay" style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.75)' }}>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-4" style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center animate-pulse" style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)' }}>
                  <i className="bi bi-robot text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h5 className="text-white fw-bold mb-0">VerX</h5>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '8px', height: '8px', background: '#86efac', borderRadius: '50%' }}></div>
                    <small style={{ color: 'rgba(255,255,255,0.8)' }}>Online agora</small>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <i className="bi bi-shield-check text-white" style={{ fontSize: '0.9rem' }}></i>
                <small className="text-white fw-bold">Assistente VerDenovo</small>
              </div>
            </div>

            {/* Mensagens */}
            <div ref={chatContainerRef} style={{ height: '420px', overflowY: 'auto', padding: '1.5rem', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', scrollbarWidth: 'none' }}>
              {messages.map((msg, index) => (
                <div key={index} className={`d-flex mb-4 ${msg.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  {msg.type === 'bot' && (
                    <div className="d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                      style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #059669, #10b981)', borderRadius: '50%', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
                      <i className="bi bi-robot text-white" style={{ fontSize: '1rem' }}></i>
                    </div>
                  )}
                  <div style={{
                    maxWidth: '75%', padding: '1rem 1.25rem',
                    borderRadius: msg.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                    whiteSpace: 'pre-line',
                    background: msg.type === 'user' ? 'linear-gradient(135deg, #059669, #10b981)' : 'white',
                    boxShadow: msg.type === 'user' ? '0 4px 15px rgba(5,150,105,0.3)' : '0 4px 15px rgba(0,0,0,0.08)',
                    color: msg.type === 'user' ? 'white' : '#374151'
                  }}>
                    <div className="mb-1" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{msg.text}</div>
                    <small className="d-block" style={{ fontSize: '0.72rem', opacity: 0.6, textAlign: msg.type === 'user' ? 'right' : 'left' }}>
                      {msg.time}
                    </small>
                  </div>
                  {msg.type === 'user' && (
                    <div className="d-flex align-items-center justify-content-center ms-3 flex-shrink-0"
                      style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '50%', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                      <i className="bi bi-person-fill text-white" style={{ fontSize: '1rem' }}></i>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #059669, #10b981)', borderRadius: '50%' }}>
                    <i className="bi bi-robot text-white" style={{ fontSize: '1rem' }}></i>
                  </div>
                  <div style={{ background: 'white', borderRadius: '20px 20px 20px 5px', padding: '1rem 1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                    <div className="d-flex gap-1 align-items-center">
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: '8px', height: '8px', background: '#059669', borderRadius: '50%', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4" style={{ background: 'rgba(255,255,255,0.9)', borderTop: '2px solid rgba(255,255,255,0.6)' }}>
              <div className="d-flex gap-3">
                <div style={{ flex: 1, position: 'relative' }}>
                  <input type="text" className="form-control"
                    placeholder="Digite o número da opção ou 0 para o menu..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    style={{ borderRadius: '14px', padding: '0.85rem 1.25rem', border: '2px solid rgba(5,150,105,0.2)', boxShadow: 'none', fontSize: '0.95rem' }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
                <button onClick={() => handleSendMessage()}
                  style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '14px', color: 'white', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)', flexShrink: 0, transition: 'all 0.2s ease' }}
                  onMouseEnter={handleMouseEnterSend}
                  onMouseLeave={handleMouseLeaveSend}>
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
