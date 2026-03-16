/**
 * Character Information for Luna & Noir
 * Used in Character Introduction Page
 */

export const characterData = {
  luna: {
    name: 'Luna',
    title: { en: 'Magic Fortune Teller', ko: '운세 마법사' },
    categories: [
      {
        id: 'about',
        icon: '✨',
        label: { en: 'About Luna', ko: '루나에 대해' },
        color: '#c084fc', // purple-400
        content: {
          en: `Luna is a fortune teller. She can see the future with her magic crystal ball.
She is very kind. She likes to help people with her magic.
Luna is very good at reading fortunes. But she has a funny secret: she is very bad with directions. She gets lost a lot!`,
          ko: `루나는 마법 수정구슬을 통해 미래를 엿볼 수 있는 재능 있는 점술가입니다.
친절한 마음씨를 가지고 있으며 신비로운 능력으로 다른 사람들을 돕고 싶어 합니다.
운세를 보는 데는 놀라운 재능을 가지고 있지만, 재미있는 비밀이 있어요: 방향감각이 엉망이라 자주 길을 잃습니다!`,
        },
      },
      {
        id: 'favorites',
        icon: '🌙',
        label: { en: 'Favorite Things', ko: '좋아하는 것들' },
        color: '#a78bfa', // purple-300
        content: {
          en: `Luna loves to watch the stars. She also likes to make moon cookies.
Her favorite drink is tea with honey. She thinks it helps her magic.
She likes to read old magic books. She also likes to collect pretty crystals.`,
          ko: `루나는 여가 시간에 별 관찰하기와 달 모양 쿠키 만들기를 좋아합니다.
가장 좋아하는 음료는 꿀을 넣은 라벤더 차인데, 마법 능력에 도움이 된다고 믿어요.
고대 주문서를 읽고 전 세계의 반짝이는 수정을 수집하는 것을 즐깁니다.`,
        },
      },
      {
        id: 'tmi',
        icon: '🎭',
        label: { en: "Luna's TMI", ko: '루나의 TMI' },
        color: '#d8b4fe', // purple-200
        content: {
          en: `Luna is very good at magic. But she is very bad at waking up in the morning!
One time, she told a student, "You will find golden treasure!" But she forgot to say it was just a gold star sticker.
Luna's magic hat is special. Her grandmother made it. But her grandmother doesn't believe in magic at all!`,
          ko: `강력한 신비술사임에도 불구하고, 루나는 아침에 일어나는 것을 정말 못합니다!
한번은 학생이 "황금 보물"을 찾을 거라고 예언했지만, 그게 금색 별 스티커라는 걸 말하는 걸 잊었어요.
그녀의 마법 모자는 사실 마법을 전혀 믿지 않는 할머니가 뜨개질로 만들어준 거랍니다.`,
        },
      },
      {
        id: 'items',
        icon: '🔮',
        label: { en: 'Magic Items', ko: '마법 아이템' },
        color: '#fbbf24', // amber-400
        content: {
          en: `Luna's crystal ball is very old. It came from her family.
Her purple hat has small pockets. She hides snacks in them (mostly cookies).
She has tarot cards that glow in the dark. They help her find the way home when she gets lost.`,
          ko: `루나의 수정구슬은 가문의 점술가들로부터 대대로 내려온 것입니다.
별이 그려진 보라색 모자에는 비상 간식(주로 쿠키)을 숨기는 작은 주머니가 있어요.
어둠 속에서 은은하게 빛나는 타로 카드 한 벌을 가지고 다니는데, 길을 잃었을 때 집으로 가는 길을 찾는 데 도움이 됩니다.`,
        },
      },
    ],
  },
  noir: {
    name: 'Noir',
    title: { en: 'Starry Kitty', ko: '별빛 냥이' },
    categories: [
      {
        id: 'hunter',
        icon: '🌟',
        label: { en: 'Night Hunter', ko: '밤의 사냥꾼' },
        color: '#60a5fa', // blue-400
        content: {
          en: `Noir is Luna's magic cat. He is a black cat with shiny eyes like stars.
At night, he sits on the roof. He looks at the stars and remembers them.
He is very good at catching toy mice. He keeps Luna's room safe.`,
          ko: `느와르는 루나의 마법 사역마로, 별처럼 반짝이는 눈을 가진 신비로운 검은 고양이입니다.
밤에는 지붕 위에 앉아 별자리를 관찰하며 모든 별 패턴을 외우는 것을 좋아해요.
장난감 쥐와 먼지 토끼를 사냥하는 뛰어난 사냥꾼으로, "위험한 침입자"로부터 루나의 점술실을 지킵니다.`,
        },
      },
      {
        id: 'favorites',
        icon: '🔔',
        label: { en: 'Favorite Things', ko: '좋아하는 것들' },
        color: '#93c5fd', // blue-300
        content: {
          en: `Noir's favorite thing is his silver bell collar. It was a gift from Luna. It makes a soft sound when he moves.
He loves warm sun, soft cushions, and the sound of Luna's tarot cards.
His favorite snack is tuna treats. But he acts like he doesn't want them!`,
          ko: `느와르의 가장 소중한 보물은 움직일 때마다 부드럽게 울리는 은방울 목걸이인데, 루나가 선물한 것입니다.
따뜻한 햇빛, 아늑한 쿠션, 그리고 루나가 타로 카드를 섞는 소리를 사랑해요.
가장 좋아하는 간식은 참치 맛 간식이지만, 너무 품위 있는 척하며 구걸하지 않으려 합니다.`,
        },
      },
      {
        id: 'logic',
        icon: '💭',
        label: { en: "Cat's Logic", ko: '고양이 논리' },
        color: '#bfdbfe', // blue-200
        content: {
          en: `Noir thinks humans are here to help cats. He thinks cats are more important!
He thinks 3 AM is a good time to talk. He says things like "I'm hungry" or "Pet me now!"
Noir thinks any high place is a "cat seat." He must test it for naps!`,
          ko: `느와르는 인간이 실제로는 고양이를 섬기기 위해 존재하는 꽤 단순한 생물이라고 믿습니다.
새벽 3시가 중요한 발표("배고파요" 또는 "지금 쓰다듬어줘")를 하기에 완벽한 시간이라고 생각해요.
그의 생각으로는, 바닥보다 높은 모든 표면은 "고양이 왕좌"이며 낮잠의 품질을 반드시 테스트해야 합니다.`,
        },
      },
      {
        id: 'moods',
        icon: '😺',
        label: { en: "Noir's Moods", ko: '느와르의 기분' },
        color: '#c084fc', // purple-400
        content: {
          en: `When his tail moves slowly, he is curious. He is watching everything!
When his tail is big and fluffy, he is surprised. (Maybe he saw a cucumber or himself in a mirror!)
When he blinks slowly, he is saying "I trust you." This is a big compliment from a cat!
When his ears are flat, give him some space. (And maybe some treats!)`,
          ko: `꼬리를 천천히 흔들 때는 호기심이 많고 관찰 중인 상태예요.
부푼 꼬리는 뭔가에 놀란 상태입니다 (보통 오이나 자기 자신의 반사상).
천천히 눈을 깜빡이는 것은 "널 믿어"라고 말하는 방식 - 고양이가 줄 수 있는 최고의 칭찬입니다!
귀가 납작할 때는 공간을 주는 게 좋아요 (그리고 아마 간식도 좀).`,
        },
      },
    ],
  },
}

// Helper functions
export const getCharacterCategories = (character) => {
  return characterData[character]?.categories || []
}

export const getCharacterInfo = (character, categoryId) => {
  const categories = getCharacterCategories(character)
  return categories.find(cat => cat.id === categoryId)
}
