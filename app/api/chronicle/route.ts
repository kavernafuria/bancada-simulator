import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const {
      season = 1,
      torcida,
      clube,
      rivalTorcida,
      rivalClub,
      stadium,
      cityState,
      isHome,
      isAllyGame,
      score,
      isVictoryPista,
      isVictoryBancada,
      tacticTitle,
      policeStance,
      extraCost,
      medical,
      desertion,
      moralChange,
      statusTitle,
      competition,
    } = payload;

    const apiKey = process.env.GEMINI_API_KEY;

    // Try Gemini API if key is configured
    if (apiKey) {
      try {
        const prompt = `Você é um cronista especializado na cultura de arquibancadas e torcidas organizadas do futebol brasileiro. 
Escreva uma crônica jornalística e apaixonada de 1 parágrafo vibrante (entre 4 a 6 frases) sobre o jogo ocorrido.

Dados da Partida:
- Ano/Temporada: ${season}
- Competição: ${competition || "Campeonato"}
- Torcida do Jogador: ${torcida} (${clube})
- Torcida Oponente: ${rivalTorcida} (${rivalClub})
- Estádio: ${stadium} em ${cityState}
- Mando de campo: ${isHome ? "Mandante (Nossa Casa/Caldeirão)" : "Visitante (Caravana / Invasão)"}
- Jogo de Aliança/Amizade: ${isAllyGame ? "SIM (Festa de Irmandade)" : "NÃO (Confronto Direto)"}
- Placar Final no Campo: ${score}
- Desfecho na Pista/Arquibancada: ${statusTitle || (isVictoryPista ? "Vitória e Domínio Total" : "Revés e Pressão")}
- Tática Utilizada: ${tacticTitle}
- Postura da Segurança/PM: ${policeStance}
- Impacto Moral: ${moralChange >= 0 ? "+" + moralChange : moralChange}
- Baixas/Feridos: ${desertion} integrantes

Diretrizes:
- Use vocabulário autêntico de bancada (ex: bateria, comboio, bandeirões, alçapão, linha de frente, cortejo, rua).
- Nunca use siglas genéricas.
- Se for jogo aliada, exalte o churrasco, a paz e a festa conjunta das baterias.
- Não use marcações em markdown, retorne texto corrido num único parágrafo fluido.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({ chronicle: generatedText.trim() });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API fallback to procedural engine:", geminiErr);
      }
    }

    // MULTI-STYLE GENERATIVE PROCEDURAL ENGINE (50+ VARIATIONS)
    if (isAllyGame) {
      const allyOpenings = [
        `No memorável encontro válido pelo ${competition || "campeonato"}, as arquibancadas do estádio ${stadium} (${cityState}) testemunharam um espetáculo histórico de irmandade entre a ${torcida} e a torcida aliada ${rivalTorcida}.`,
        `O ambiente no entorno do ${stadium} foi marcado por pura integração cultural, reunindo a massa da ${torcida} e os irmãos da ${rivalTorcida} em um churrasco farto com costela de chão e cerveja gelada na sede social.`,
        `Em dia de festa oficial do eixo de alianças, a ${torcida} recebeu com honras de gala a comitiva da ${rivalTorcida} para um cortejo conjunto pelas ruas de ${cityState}.`,
      ];
      const allyMiddles = [
        `As duas baterias cantaram unidas os 90 minutos, transformando o setor em uma caldeirão de samba, pirotecnia colorida e bobinas gigantescas.`,
        `Dentro de campo o placar fechou em ${score}, mas a verdadeira vitória deu-se no respeito mútuo e na celebração das bandeiras irmãs hasteadas lado a lado.`,
        `Sob o olhar sereno da segurança pública (${policeStance}), os associados dividiram a mesma bancada sem qualquer tipo de barreira ou tensão.`,
      ];
      const allyClosings = [
        `Um dia que fica cravado na memória da torcida como símbolo da verdadeira cultura popular de arquibancada.`,
        `O evento fortaleceu ainda mais os laços do eixo nacional, garantindo recebimento de gala nos próximos deslocamentos pelo Brasil.`,
        `A festa encerrou-se com aplausos de pé de todo o estádio para o show das baterias unificadas.`,
      ];

      const op = allyOpenings[Math.floor(Math.random() * allyOpenings.length)];
      const mi = allyMiddles[Math.floor(Math.random() * allyMiddles.length)];
      const cl = allyClosings[Math.floor(Math.random() * allyClosings.length)];

      return NextResponse.json({ chronicle: `[Ano ${season} - ${competition || "Campeonato"}] ${op} ${mi} ${cl}` });
    }

    // Standard Derby Matches (Victory or Defeat Narratives)
    const homeStr = isHome
      ? `defendendo o nosso alçapão no estádio ${stadium}`
      : `em caravana de invasão ao setor visitante do estádio ${stadium} em ${cityState}`;

    if (isVictoryPista) {
      const vicOpenings = [
        `[Ano ${season} - ${competition || "Campeonato"}] Dia de afirmação categórica para a ${torcida} ${homeStr} contra o ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] A atmosfera de decisão tomou conta do ${stadium} quando a ${torcida} impôs sua força ${homeStr} diante da torcida do ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] Com casa cheia e pulsando forte, a ${torcida} viveu uma jornada memorável ${homeStr} enfrentando a torcida do ${rivalClub} (${rivalTorcida}).`,
      ];
      const vicMiddles = [
        `A estratégia de ${tacticTitle} funcionou com perfeição cirúrgica, garantindo o controle total das vias de acesso e incendiando o setor com canto ininterrupto.`,
        `Mesmo diante do esquema de segurança (${policeStance}), a diretoria conduziu a massa com maestria, sobressaindo-se na pressão de bancada e no empenho dos associados.`,
        `A resposta nas arquibancadas refletiu-se no placar de ${score}, com a bateria ditando o ritmo e sufocando qualquer reação dos oponentes.`,
      ];
      const vicClosings = [
        `${statusTitle || "Domínio absoluto"}. Moral da bancada em alta (+${moralChange}) com baixas contidas de apenas ${desertion} integrantes.`,
        `A jornada consagrou a liderança da diretoria na gestão da pista, injetando enorme moral (+${moralChange}) e respeito para os próximos desafios.`,
        `Ao apito final, a festa estendeu-se pela sede social celebrando mais um capítulo vitorioso na história da torcida.`,
      ];

      const op = vicOpenings[Math.floor(Math.random() * vicOpenings.length)];
      const mi = vicMiddles[Math.floor(Math.random() * vicMiddles.length)];
      const cl = vicClosings[Math.floor(Math.random() * vicClosings.length)];

      return NextResponse.json({ chronicle: `${op} ${mi} ${cl}` });
    } else {
      const defOpenings = [
        `[Ano ${season} - ${competition || "Campeonato"}] Jornada de altíssima exigência e clima pesado para a ${torcida} ${homeStr} diante do ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] O teste de fogo no estádio ${stadium} impôs severas provações para a ${torcida} no confronto contra o ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] Sob intensa vigilância policial e forte pressão nas ruas de ${cityState}, a ${torcida} encarou um duro embate ${homeStr} com a torcida do ${rivalClub} (${rivalTorcida}).`,
      ];
      const defMiddles = [
        `A tentativa de aplicar a tática de ${tacticTitle} esbarrou em contratempos operacionais e no forte bloqueio da segurança pública (${policeStance}).`,
        `Em campo o placar registrou ${score}, enquanto na pista as linhas de frente enfrentaram um cenário adverso e de extrema contenção.`,
        `As complicações na logística e o clima tenso no entorno geraram atritos que exigiram pronta intervenção das lideranças.`,
      ];
      const defClosings = [
        `${statusTitle || "Prejuízo na pista"}. O saldo registrou abalo moral (${moralChange}) e ${desertion} membros que necessitaram de assistência médica.`,
        `A diretoria já convocou reunião de emergência na sede para reavaliar os protocolos de pista e recuperar a moral da tropa para a sequência.`,
        `Apesar dos danos acumulados, a torcida mantém-se de pé e firma no compromisso de apoiar o clube nos momentos mais difíceis.`,
      ];

      const op = defOpenings[Math.floor(Math.random() * defOpenings.length)];
      const mi = defMiddles[Math.floor(Math.random() * defMiddles.length)];
      const cl = defClosings[Math.floor(Math.random() * defClosings.length)];

      return NextResponse.json({ chronicle: `${op} ${mi} ${cl}` });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
