import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import nanguaBear from "./assets/plushies/nangua-bear.png";
import bigBear from "./assets/plushies/big-bear.png";
import linaBear from "./assets/plushies/lina-bear.png";
import sausageDog from "./assets/plushies/sausage-dog.png";
import winnie from "./assets/plushies/winnie.png";
import xiaodoudou from "./assets/plushies/xiaodoudou.png";

type Plushie = {
  id: string;
  name: string;
  image: string;
};

type CountMap = Record<string, number>;

const titleGlyphs = [
  { char: "小", x: 128, y: 138, rotate: -1.6, scaleX: 1.01 },
  { char: "熊", x: 242, y: 138, rotate: -0.5, scaleX: 1.02 },
  { char: "翻", x: 398, y: 137, rotate: 0.35, scaleX: 1 },
  { char: "牌", x: 526, y: 138, rotate: -0.3, scaleX: 1.04 },
  { char: "器", x: 680, y: 138, rotate: -0.8, scaleX: 1.01 },
];

const plushies: Plushie[] = [
  { id: "nangua-bear", name: "南瓜熊", image: nanguaBear },
  { id: "big-bear", name: "大熊", image: bigBear },
  { id: "lina-bear", name: "玲娜贝儿", image: linaBear },
  { id: "sausage-dog", name: "腊肠狗", image: sausageDog },
  { id: "winnie", name: "维尼小熊", image: winnie },
  { id: "xiaodoudou", name: "小豆豆", image: xiaodoudou },
];

const STORAGE_KEY = "bear-flip-counts";
const CARD_COUNT = plushies.length;
const FLIP_DURATION = 720;

const mediumStars = [
  { left: "10%", top: "14%", delay: "0.4s", duration: "8.8s" },
  { left: "18%", top: "10%", delay: "1.7s", duration: "9.9s" },
  { left: "27%", top: "20%", delay: "1.1s", duration: "9.4s" },
  { left: "36%", top: "18%", delay: "2.8s", duration: "8.6s" },
  { left: "45%", top: "11%", delay: "2s", duration: "10.2s" },
  { left: "63%", top: "16%", delay: "0.8s", duration: "9.1s" },
  { left: "72%", top: "11%", delay: "1.5s", duration: "10.1s" },
  { left: "81%", top: "18%", delay: "2.3s", duration: "9.8s" },
  { left: "91%", top: "26%", delay: "0.9s", duration: "8.7s" },
  { left: "8%", top: "60%", delay: "2.1s", duration: "10.3s" },
  { left: "13%", top: "78%", delay: "1.4s", duration: "10.2s" },
  { left: "24%", top: "70%", delay: "0.6s", duration: "9.2s" },
  { left: "34%", top: "84%", delay: "0.5s", duration: "8.9s" },
  { left: "52%", top: "74%", delay: "1.3s", duration: "9.7s" },
  { left: "67%", top: "79%", delay: "1.9s", duration: "10.4s" },
  { left: "78%", top: "66%", delay: "2.4s", duration: "8.8s" },
  { left: "86%", top: "73%", delay: "2.6s", duration: "9.3s" },
];

const glowStars = [
  { left: "8%", top: "24%", size: 176, delay: "0s", duration: "15s" },
  { left: "82%", top: "22%", size: 196, delay: "2.6s", duration: "16.5s" },
  { left: "76%", top: "72%", size: 164, delay: "1.1s", duration: "14.8s" },
];

function shuffleArray<T>(array: T[]) {
  const nextArray = [...array];
  for (let index = nextArray.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextArray[index], nextArray[swapIndex]] = [
      nextArray[swapIndex],
      nextArray[index],
    ];
  }
  return nextArray;
}

function getTodayDate() {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function createHiddenState() {
  return Array(CARD_COUNT).fill(false);
}

function createInitialCounts(saved: string | null): CountMap {
  const baseCounts = plushies.reduce<CountMap>((result, item) => {
    result[item.id] = 0;
    return result;
  }, {});

  if (!saved) {
    return baseCounts;
  }

  try {
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return baseCounts;
    }

    plushies.forEach((item) => {
      const rawValue = (parsed as Record<string, unknown>)[item.id];
      baseCounts[item.id] =
        typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : 0;
    });

    return baseCounts;
  } catch {
    return baseCounts;
  }
}

function TitleArt() {
  return (
    <svg
      className="title-art"
      viewBox="0 0 860 200"
      role="img"
      aria-labelledby="title-art-label"
    >
      <title id="title-art-label">小熊翻牌器</title>
      <defs>
        <filter id="title-soft-glow" x="-25%" y="-35%" width="150%" height="180%">
          <feGaussianBlur stdDeviation="6.5" />
        </filter>
      </defs>

      <g
        fill="#d8d0ed"
        opacity="0.9"
        filter="url(#title-soft-glow)"
        fontFamily={'"RuanMengTiTitle", "SF Pro Rounded", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'}
        fontSize="126"
        fontWeight="400"
      >
        {titleGlyphs.map((glyph) => (
          <text
            key={`glow-${glyph.char}`}
            x={glyph.x}
            y={glyph.y}
            textAnchor="middle"
            transform={`rotate(${glyph.rotate} ${glyph.x} ${glyph.y}) scale(${glyph.scaleX} 1)`}
          >
            {glyph.char}
          </text>
        ))}
      </g>

      <g
        fill="#6B5A86"
        fontFamily={'"RuanMengTiTitle", "SF Pro Rounded", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'}
        fontSize="126"
        fontWeight="400"
      >
        {titleGlyphs.map((glyph) => (
          <text
            key={glyph.char}
            x={glyph.x}
            y={glyph.y}
            textAnchor="middle"
            transform={`rotate(${glyph.rotate} ${glyph.x} ${glyph.y}) scale(${glyph.scaleX} 1)`}
          >
            {glyph.char}
          </text>
        ))}
      </g>
    </svg>
  );
}

function App() {
  const resetTimerRef = useRef<number | null>(null);

  const [cardPlushies, setCardPlushies] = useState<Plushie[]>(() =>
    shuffleArray(plushies)
  );
  const [revealed, setRevealed] = useState<boolean[]>(() => createHiddenState());
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [lastPicked, setLastPicked] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [counts, setCounts] = useState<CountMap>(() =>
    createInitialCounts(localStorage.getItem(STORAGE_KEY))
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  }, [counts]);

  useEffect(() => {
    plushies.forEach((item) => {
      const image = new Image();
      image.src = item.image;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const roundLocked = pickedIndex !== null;
  const totalFlipCount = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts]
  );

  const resultTitle = roundLocked ? "今晚抽到的是" : "今晚抽到的是谁";
  const resultText = roundLocked
    ? lastPicked
    : "还没翻开时 它们都安静藏在牌背后";
  const hintText = "";

  const handleCardClick = (index: number) => {
    if (isResetting || roundLocked) {
      return;
    }

    const picked = cardPlushies[index];
    const nextRevealed = createHiddenState();
    nextRevealed[index] = true;

    setRevealed(nextRevealed);
    setPickedIndex(index);
    setLastPicked(picked.name);
    setCounts((previous) => ({
      ...previous,
      [picked.id]: (previous[picked.id] ?? 0) + 1,
    }));
  };

  const handleResetConfirm = () => {
    setShowConfirm(false);
    setRevealed(createHiddenState());
    setIsResetting(true);

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCardPlushies(shuffleArray(plushies));
      setLastPicked("");
      setPickedIndex(null);
      setIsResetting(false);
      resetTimerRef.current = null;
    }, FLIP_DURATION);
  };

  return (
    <div className="page">
      <div className="dust-layer" />

      <div className="stars-layer stars-layer--glow">
        {glowStars.map((star, index) => (
          <span
            key={`glow-${index}`}
            className="glow-star"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className="stars-layer stars-layer--medium">
        {mediumStars.map((star, index) => (
          <span
            key={`medium-${index}`}
            className="medium-star"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      <div className="layout">
        <aside className="sidebar">
          <div className="info-card info-card--intro">
            <div className="info-header">
              <span className="info-icon">✦</span>
              <p className="info-label">今晚的小礼物</p>
            </div>
            <p className="date-text">{getTodayDate()}</p>
            <p className="info-copy">
              挑一张吧 今晚的小家伙在等你翻开
            </p>
          </div>

          <div className="info-card info-card--count">
            <div className="info-header info-header--between">
              <div className="info-header-group">
                <span className="info-icon">☾</span>
                <p className="info-label">累计抽取次数</p>
              </div>
            </div>
            <p className="count-total">{totalFlipCount}</p>
            <p className="info-copy">翻开一次 就多一次</p>
          </div>

          <div className="info-card info-card--result">
            <div className="info-header">
              <span className="info-icon">✧</span>
              <p className="info-label">{resultTitle}</p>
            </div>
            <p className={`result-name ${roundLocked ? "is-picked" : ""}`}>
              {resultText}
            </p>
            <p className="info-copy">
              {roundLocked
                ? "这一晚就让它陪着你"
                : "等你挑出今晚这一张"}
            </p>
          </div>

          <div className="info-card">
            <div className="info-header">
              <span className="info-icon">❀</span>
              <p className="info-label">奖池成员</p>
            </div>

            <div className="pool-tags">
              {plushies.map((item) => (
                <span key={item.id} className="pool-tag">
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="hero">
            <p className="hero-kicker">
              睡前的小小惊喜
              <span className="hero-kicker-moon" aria-hidden="true">
                ♥
              </span>
            </p>
            <h1 className="title">
              <TitleArt />
            </h1>
            <p className="result-text">{roundLocked ? `今晚翻到的是 ${lastPicked}` : "今晚的小礼物就在这里～"}</p>
            <p className="hint-text">{hintText}</p>

            <button
              className="reset-button"
              onClick={() => setShowConfirm(true)}
              disabled={isResetting}
            >
              重新抽牌
            </button>
          </header>

          <section className={`card-grid ${roundLocked ? "is-locked" : ""}`}>
            {cardPlushies.map((item, index) => {
              const isPicked = pickedIndex === index;
              const isRevealed = revealed[index];
              const isResting = roundLocked && !isPicked;

              return (
                <button
                  key={index}
                  className={`flip-card ${isRevealed ? "is-revealed" : ""} ${isPicked ? "is-picked" : ""} ${isResting ? "is-resting" : ""}`}
                  onClick={() => handleCardClick(index)}
                  disabled={isResetting || roundLocked}
                >
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <div className="card-frame" />
                      <span className="front-glow" />
                      <div className="front-badge">轻轻翻开</div>
                      <div className="front-title">晚安小牌</div>
                      <div className="front-subtitle">今晚的小礼物藏在里面</div>
                    </div>

                    <div className="flip-card-back">
                      <div className="card-frame" />
                      <span className="back-bloom" />
                      <div className="image-wrap">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="plushie-image"
                        />
                      </div>
                      <div className="name-tag">{item.name}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

          <p className="bottom-wish">
            愿今晚的这只小家伙，替我陪你慢慢睡着
          </p>
        </main>
      </div>

      {showConfirm && (
        <div className="modal-mask" onClick={() => setShowConfirm(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <p className="modal-title">要重新抽一轮吗？</p>
            <p className="modal-text">
              这轮的小礼物会轻轻合上，再把 6 张牌重新洗好，等你重新挑一张
            </p>

            <div className="modal-actions">
              <button className="modal-btn primary" onClick={handleResetConfirm}>
                重新抽牌
              </button>
              <button
                className="modal-btn secondary"
                onClick={() => setShowConfirm(false)}
              >
                先留着这一轮
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
