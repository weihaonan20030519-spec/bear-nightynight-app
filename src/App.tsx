import { useEffect, useMemo, useState } from "react";
import "./App.css";

import nanguaBear from "./assets/plushies/nangua-bear.png";
import bigBear from "./assets/plushies/big-bear.png";
import linaBear from "./assets/plushies/lina-bear.png";
import sausageDog from "./assets/plushies/sausage-dog.png";
import winnie from "./assets/plushies/winnie.png";

type Plushie = {
  id: string;
  name: string;
  image: string;
};

type CountMap = Record<string, number>;

const plushies: Plushie[] = [
  { id: "nangua-bear", name: "南瓜熊", image: nanguaBear },
  { id: "big-bear", name: "大熊", image: bigBear },
  { id: "lina-bear", name: "玲娜贝尔", image: linaBear },
  { id: "sausage-dog", name: "腊肠狗", image: sausageDog },
  { id: "winnie", name: "维尼小熊", image: winnie },
];

const STORAGE_KEY = "bear-flip-counts";

function shuffleArray<T>(array: T[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getTodayDate() {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function App() {
  const [cardPlushies, setCardPlushies] = useState<Plushie[]>(() =>
    shuffleArray(plushies)
  );
  const [revealed, setRevealed] = useState<boolean[]>(Array(5).fill(false));
  const [lastPicked, setLastPicked] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const FLIP_DURATION = 400;
  const [isResetting, setIsResetting] = useState(false);

  const [counts, setCounts] = useState<CountMap>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }

    const initialCounts: CountMap = {};
    plushies.forEach((item) => {
      initialCounts[item.id] = 0;
    });
    return initialCounts;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  }, [counts]);
  useEffect(() => {
  plushies.forEach((item) => {
    const img = new Image();
    img.src = item.image;
  });
}, []);


  const sortedPlushies = useMemo(() => {
    return [...plushies].sort((a, b) => {
      return (counts[b.id] ?? 0) - (counts[a.id] ?? 0);
    });
  }, [counts]);

  const handleCardClick = (index: number) => {
  if (isResetting) return;
  if (revealed[index]) return;

    const picked = cardPlushies[index];
    const nextRevealed = [...revealed];
    nextRevealed[index] = true;

    setRevealed(nextRevealed);
    setLastPicked(picked.name);
    setCounts((prev) => ({
      ...prev,
      [picked.id]: (prev[picked.id] ?? 0) + 1,
    }));
  };

const handleResetConfirm = () => {
  setShowConfirm(false);
  setIsResetting(true);

  // 先让所有牌翻回去
  setRevealed(Array(5).fill(false));
  setLastPicked('');

  // 等翻牌动画结束后，再换下一轮内容
  window.setTimeout(() => {
    setCardPlushies(shuffleArray(plushies));
    setIsResetting(false);
  }, FLIP_DURATION);
};

  const stars = [
    { left: "8%", top: "10%", delay: "0s", duration: "6s" },
    { left: "18%", top: "22%", delay: "1s", duration: "8s" },
    { left: "30%", top: "8%", delay: "2s", duration: "7s" },
    { left: "42%", top: "16%", delay: "0.5s", duration: "9s" },
    { left: "57%", top: "10%", delay: "1.5s", duration: "7.5s" },
    { left: "70%", top: "18%", delay: "2.5s", duration: "8.5s" },
    { left: "84%", top: "12%", delay: "1.2s", duration: "6.5s" },
    { left: "12%", top: "72%", delay: "0.8s", duration: "7.8s" },
    { left: "25%", top: "84%", delay: "2.2s", duration: "8.2s" },
    { left: "62%", top: "82%", delay: "0.3s", duration: "7.2s" },
    { left: "78%", top: "76%", delay: "1.7s", duration: "9.2s" },
    { left: "90%", top: "64%", delay: "2.8s", duration: "7.6s" },
  ];

  return (
    <div className="page">
      <div className="stars-layer">
        {stars.map((star, index) => (
          <span
            key={index}
            className="star"
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
          <div className="info-card">
            <p className="info-label">今天日期</p>
            <p className="date-text">{getTodayDate()}</p>
          </div>

          <div className="info-card">
            <p className="info-label">累计翻牌次数</p>
            <div className="count-list">
              {sortedPlushies.map((item) => (
                <div key={item.id} className="count-row">
                  <span className="count-name">{item.name}</span>
                  <span className="count-number">{counts[item.id] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="hero">
            <p className="title">小熊翻牌器</p>
            <p className="result-text">
              {lastPicked
                ? `今夜被翻到的是——${lastPicked}`
                : "今夜被翻到的是——"}
            </p>
            <p className="hint-text">
              点开一块牌子，看看今晚是谁陪你入睡。
            </p>

            <button className="reset-button" onClick={() => setShowConfirm(true)}>
              重新翻牌
            </button>
          </header>

          <section className="card-grid">
            {cardPlushies.map((item, index) => {
              const isRevealed = revealed[index];

              return (
                <button
                  key={index}
                  className={`flip-card ${isRevealed ? "is-revealed" : ""}`}
                  onClick={() => handleCardClick(index)}
                  disabled={isRevealed}
                >
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <div className="front-badge">点击翻牌</div>
                      <div className="front-title">晚安小牌</div>
                      <div className="front-subtitle">今晚是谁来陪你呢~</div>
                    </div>

                    <div className="flip-card-back">
                      <div className="image-wrap">
                        <img src={item.image} alt={item.name} className="plushie-image" />
                      </div>
                      <div className="name-tag">{item.name}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

           <p className="bottom-wish">愿今晚有软乎乎的小熊陪你做个好梦。</p>
        </main>
      </div>

      {showConfirm && (
        <div className="modal-mask" onClick={() => setShowConfirm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">小熊确定吗</p>
            <p className="modal-text">
              重新翻牌后，这一轮的小熊结果会被重新抽取哦。
            </p>

            <div className="modal-actions">
              <button className="modal-btn primary" onClick={handleResetConfirm}>
                嗯！
              </button>
              <button
                className="modal-btn secondary"
                onClick={() => setShowConfirm(false)}
              >
                不要啦
              </button>
            </div>
          </div>
        </div>
      )}
     
    </div>
  );
}

export default App;