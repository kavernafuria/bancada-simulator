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
        const prompt = `Você é um líder histórico e cronista de rua de uma torcida organizada do futebol brasileiro. 
Escreva uma crônica empolgante, crua e visceral de 1 parágrafo vibrante (4 a 6 frases) sobre o jogo ocorrido.

DADOS DA PARTIDA:
- Ano/Temporada: ${season}
- Competição: ${competition || "Campeonato"}
- Nossa Torcida: ${torcida} (${clube})
- Oponente: ${rivalTorcida} (${rivalClub})
- Estádio: ${stadium} (${cityState})
- Mando: ${isHome ? "Mandante (Nosso Caldeirão)" : "Visitante (Caravana / Invasão)"}
- Tipo de Jogo: ${isAllyGame ? "FESTA DE ALIANÇA & UNIDADE" : "CONFRONTO DE PISTA & RIVALIDADE"}
- Placar do Jogo: ${score}
- Resultado de Pista: ${statusTitle || (isVictoryPista ? "Vitória e Domínio de Rua" : "Pressão e Revés Tático")}
- Tática Usada: ${tacticTitle}
- Postura da PM: ${policeStance}
- Saldo Moral: ${moralChange >= 0 ? "+" + moralChange : moralChange}
- Feridos/Baixas: ${desertion} integrantes

REGRAS OBRIGATÓRIAS DE LINGUAGEM & GÍRIAS DE BANCADA:
1. Use gírias autênticas das torcidas brasileiras como: "bonde", "pista", "caldeirão", "alçapão", "linha de frente", "bateria", "cortejo", "ruada", "disposição", "sem amarelada", "trocação", "panos", "bandeirões", "resenha na sede", "chopp gelado", "comboio de ônibus", "antenas", "respeito de rua".
2. Se for JOGO DE ALIANÇA: Exalte o churrasco de costela no fogo de chão, o respeito entre as agremiações, as baterias tocando juntas o mesmo samba e a festa unificada sem divisórias.
3. Se for RIVALIDADE: Exalte o empenho da massa, o grito ensurdecedor nos 90 minutos, a imponência dos nossos panos e a postura firme da linha de frente.
4. NUNCA coloque siglas genéricas entre parênteses como (TGF), (FJV), (TJS).
5. Retorne APENAS um parágrafo corrido de texto puro, sem tópicos ou markdown.`;

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

    // MULTI-STYLE GENERATIVE PROCEDURAL ENGINE (500+ VARIATIONS)
    if (isAllyGame) {
      const allyOpenings = [
        `No memorável encontro válido pelo ${competition || "campeonato"}, as arquibancadas do estádio ${stadium} (${cityState}) testemunharam um espetáculo histórico de irmandade entre a ${torcida} e a torcida aliada ${rivalTorcida}.`,
        `O ambiente no entorno do ${stadium} foi marcado por pura integração cultural, reunindo a massa da ${torcida} e os irmãos da ${rivalTorcida} em um churrasco farto com costela de chão e cerveja gelada na sede social.`,
        `Em dia de festa oficial do eixo de alianças, a ${torcida} recebeu com honras de gala a comitiva da ${rivalTorcida} para um cortejo conjunto pelas ruas de ${cityState}.`,
        `A comunhão entre as torcidas aliadas atingiu seu auge no estádio ${stadium}, quando os bandeirões da ${torcida} e da ${rivalTorcida} subiram juntos sob aplausos gerais.`,
        `A recepção da ${rivalTorcida} em ${cityState} reafirmou a força histórica da união do nosso eixo nas arquibancadas brasileiras.`,
        `Dia de exaltação à cultura de bancada no ${stadium}: a ${torcida} abriu as portas da sede para os irmãos da ${rivalTorcida} em um encontro inesquecível.`,
        `Com churrasqueira acesa desde as primeiras horas da manhã, a concentração da ${torcida} reuniu centenas de associados e aliados da ${rivalTorcida} antes da partida.`,
        `A atmosfera festiva no estádio ${stadium} deu o tom do clássico de fraternidade disputado pelo ${competition || "campeonato"}.`,
      ];

      const allyMiddles = [
        `As duas baterias cantaram unidas os 90 minutos, transformando o setor em uma caldeirão de samba, pirotecnia colorida e bobinas gigantescas.`,
        `Dentro de campo o placar fechou em ${score}, mas a verdadeira vitória deu-se no respeito mútuo e na celebração das bandeiras irmãs hasteadas lado a lado.`,
        `Sob o olhar sereno da segurança pública (${policeStance}), os associados dividiram a mesma bancada sem qualquer tipo de barreira ou tensão.`,
        `Os ritmistas sincronizaram repiques e surdos em uma exibição de gala que ecoou por todo o estádio ${stadium}.`,
        `A condução pacífica e o clima de festa em família garantiram um espetáculo visual de fumaça viva e panos estendidos.`,
        `Sem qualquer entrevero de rua, as lideranças das duas agremiações celebraram o pacto de paz e apoio mútuo nos deslocamentos.`,
        `A vibração das baterias contagiou até os setores neutros do estádio, aplaudindo o comportamento exemplar das organizadas.`,
        `O empenho dos departamentos de festa garantiu um mosaico duplo combinando as cores tradicionais dos dois clubes.`,
      ];

      const allyClosings = [
        `Um dia que fica cravado na memória da torcida como símbolo da verdadeira cultura popular de arquibancada.`,
        `O evento fortaleceu ainda mais os laços do eixo nacional, garantindo recebimento de gala nos próximos deslocamentos pelo Brasil.`,
        `A festa encerrou-se com aplausos de pé de todo o estádio para o show das baterias unificadas.`,
        `Ao término do jogo, o cortejo de despedida nas saídas do estádio selou mais um capítulo da aliança histórica.`,
        `A diretoria parabenizou todos os envolvidos na organização dessa recepção impecável em ${cityState}.`,
        `O legado desse encontro servirá de modelo para as próximas gerações de associados das duas entidades.`,
        `Com sentimento de dever cumprido, a torcida celebrou a paz e a união no regresso às suas sedes e sub-sedes.`,
        `Uma aula de civismo e paixão futebolística que engrandece a história da ${torcida}.`,
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
        `[Ano ${season} - ${competition || "Campeonato"}] O cerco fechou no estádio ${stadium} e a resposta da ${torcida} foi avassaladora ${homeStr} contra os rivais do ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] Vitória maiúscula da ${torcida} ${homeStr}, mostrando quem manda na região no duelo contra o ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] A força da massa falou mais alto no ${stadium} com a ${torcida} dominando todas as ações ${homeStr} contra o ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] Noite de gala e imposição de respeito para a ${torcida} ${homeStr} no clássico diante do ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] A linha de frente e a bancada da ${torcida} deram um show de postura ${homeStr} contra a torcida oponente do ${rivalClub} (${rivalTorcida}).`,
      ];

      const vicMiddles = [
        `A tática de ${tacticTitle} funcionou com perfeição cirúrgica, garantindo o controle total das vias de acesso e incendiando o setor com canto ininterrupto.`,
        `Mesmo diante do esquema de segurança (${policeStance}), a diretoria conduziu a massa com maestria, sobressaindo-se na pressão de bancada e no empenho dos associados.`,
        `A resposta nas arquibancadas refletiu-se no placar de ${score}, com a bateria ditando o ritmo e sufocando qualquer reação dos oponentes.`,
        `O bonde manteve a coesão do início ao fim, neutralizando as investidas da ${rivalTorcida} e garantindo hegemonia total na pista.`,
        `Com fogos de artifício e bandeirões no alto, a torcida empurrou o time em campo enquanto travava a disputa de cantos no estádio.`,
        `A liderança de pista atuou com energia e disciplina, assegurando que o setor permanecesse sob controle pleno do nosso contingente.`,
        `O espetáculo pirotécnico e o ritmo frenético dos surdos deixaram os adversários sem qualquer margem de reação.`,
        `A coordenação das sub-sedes e bondes regionais garantiu uma presença de massa impressionante nas arquibancadas.`,
      ];

      const vicClosings = [
        `${statusTitle || "Domínio absoluto"}. Moral da bancada em alta (+${moralChange}) com baixas contidas de apenas ${desertion} integrantes.`,
        `A jornada consagrou a liderança da diretoria na gestão da pista, injetando enorme moral (+${moralChange}) e respeito para os próximos desafios.`,
        `Ao apito final, a festa estendeu-se pela sede social celebrando mais um capítulo vitorioso na história da torcida.`,
        `O resultado consolida a ${torcida} entre as forças mais respeitadas no cenário nacional de arquibancadas.`,
        `Saldo amplamente positivo com moral nas alturas (+${moralChange}) e regresso em festa da tropa para a sede.`,
        `Um triunfo de respeito, organização e imposição territorial que será lembrado por longas temporadas.`,
        `Comemoração efusiva nos ônibus e na praça central da cidade marcando a supremacia total do nosso pavilhão.`,
        `A diretoria agradeceu o empenho de cada associado que colocou a alma na bancada nessa batalha inesquecível.`,
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
        `[Ano ${season} - ${competition || "Campeonato"}] Tensão máxima no entorno do ${stadium} em uma partida de elevado risco para a ${torcida} contra o ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] O cenário adverso no estádio ${stadium} exigiu sacrifício extremo da ${torcida} no embate ${homeStr} contra a ${rivalTorcida}.`,
        `[Ano ${season} - ${competition || "Campeonato"}] Embate espinhoso em ${cityState}: a ${torcida} teve de medir forças ${homeStr} enfrentando a bem estruturada torcida do ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] Tarde de superação e contenção de danos para a ${torcida} ${homeStr} na disputa amarga contra o ${rivalClub} (${rivalTorcida}).`,
        `[Ano ${season} - ${competition || "Campeonato"}] A pressão das ruas e os imprevistos de logística complicaram a ação da ${torcida} ${homeStr} frente ao ${rivalClub} (${rivalTorcida}).`,
      ];

      const defMiddles = [
        `A tentativa de aplicar a tática de ${tacticTitle} esbarrou em contratempos operacionais e no forte bloqueio da segurança pública (${policeStance}).`,
        `Em campo o placar registrou ${score}, enquanto na pista as linhas de frente enfrentaram um cenário adverso e de extrema contenção.`,
        `As complicações na logística e o clima tenso no entorno geraram atritos que exigiram pronta intervenção das lideranças.`,
        `O cerco policial ostensivo e o bloqueio de vias prejudicaram a chegada dos comboios principais ao setor designado.`,
        `Apesar da postura brava do nosso bonde, a superioridade numérica momentânea do rival exigiu recuo tático de contenção.`,
        `Desfalcada de parte dos instrumentos devido a apreensões na revista, a bateria teve de se desdobrar no grito raçudo.`,
        `A turbulência nas catracas e os confrontos pontuais nos arredores desarticularam a festa planejada para o setor.`,
        `Mesmo com a garra dos veteranos, o impacto das intervenções da PM (${policeStance}) limitou a resposta de bancada.`,
      ];

      const defClosings = [
        `${statusTitle || "Prejuízo na pista"}. O saldo registrou abalo moral (${moralChange}) e ${desertion} membros que necessitaram de assistência médica.`,
        `A diretoria já convocou reunião de emergência na sede para reavaliar os protocolos de pista e recuperar a moral da tropa para a sequência.`,
        `Apesar dos danos acumulados, a torcida mantém-se de pé e firma no compromisso de apoiar o clube nos momentos mais difíceis.`,
        `O momento pede cabeça fria, reorganização dos bondes e foco total na recuperação da autonomia financeira e moral.`,
        `Saldo de provação que servirá de aprendizado tático para a reconstrução da nossa postura nos próximos clássicos.`,
        `Lideranças atuam na assistência aos associados feridos (${desertion} membros) e na defesa jurídica perante os órgãos de fiscalização.`,
        `A bancada sentiu a baque (${moralChange} moral), mas o compromisso com o pavilhão permanece inabalável diante de qualquer revés.`,
        `Apoio incondicional aos feridos e convocação geral da massa para fechar fileiras e retomar a força da torcida.`,
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
