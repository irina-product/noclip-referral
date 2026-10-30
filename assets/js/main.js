const DEFAULT_LINK = 'noclip.tech/r/druzhok42';
const SHARE_TEXT = 'Залетай в noclip по моей ссылке — получишь +7 дней к подписке';
const PARTY_HINTS = [
  'Пати пустая. Зови первого — +7 дней тебе.',
  'Ещё двое — и месяц твой.',
  'Последний слот! За него сразу +16 дней.',
  'Пати собрана: +30 дней. Собираем новую?',
];

export function plural(n, one, few, many) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

// +7, +7, +16 за каждую тройку друзей
export function rewardDays(friends) {
  const rest = friends % 3;
  return Math.floor(friends / 3) * 30 + (rest === 1 ? 7 : rest === 2 ? 14 : 0);
}

export function calcTexts(n) {
  const days = rewardDays(n);
  const parties = Math.floor(n / 3);
  const friendDays = n * 7;
  const months = parties > 0
    ? `${parties} ${plural(parties, 'полная пати', 'полные пати', 'полных пати')} — это ${parties} ${plural(parties, 'месяц', 'месяца', 'месяцев')}${n % 3 ? ' и ещё немного' : ''}`
    : `До месяца — ещё ${3 - n} ${plural(3 - n, 'друг', 'друга', 'друзей')}`;
  return {
    days,
    word: plural(days, 'день', 'дня', 'дней'),
    months,
    friends: `А друзья получат ${friendDays} ${plural(friendDays, 'день', 'дня', 'дней')} на всех. Все в плюсе.`,
  };
}

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const ref = (params.get('ref') || DEFAULT_LINK).replace(/^https?:\/\//, '');
  const invitedRaw = Number.parseInt(params.get('invited') ?? '1', 10);
  const invited = Number.isNaN(invitedRaw) ? 1 : Math.max(0, Math.min(3, invitedRaw));
  return { ref, invited };
}

function setupLink(link) {
  const full = `https://${link}`;
  const url = encodeURIComponent(full);
  const text = encodeURIComponent(SHARE_TEXT);
  const shareUrls = {
    tg: `https://t.me/share/url?url=${url}&text=${text}`,
    vk: `https://vk.com/share.php?url=${url}`,
    wa: `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${full}`)}`,
  };

  document.querySelectorAll('[data-ref-link]').forEach((el) => { el.textContent = link; });
  document.querySelectorAll('[data-share]').forEach((el) => { el.href = shareUrls[el.dataset.share]; });

  const status = document.querySelector('[data-copy-status]');
  let resetTimer;
  const buttons = document.querySelectorAll('[data-copy]');
  const markCopied = () => {
    buttons.forEach((b) => { b.textContent = 'Скопировано ✓'; });
    if (status) status.textContent = 'Ссылка скопирована';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      buttons.forEach((b) => { b.textContent = 'Скопировать'; });
      if (status) status.textContent = '';
    }, 1800);
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (navigator.clipboard) navigator.clipboard.writeText(full).then(markCopied, markCopied);
      else markCopied();
    });
  });

  document.querySelector('[data-share-more]')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: 'noclip', text: SHARE_TEXT, url: full }).catch(() => {});
    } else {
      window.open(shareUrls.tg, '_blank', 'noopener');
    }
  });
}

function setupParty(invited) {
  document.querySelector('[data-invited]').textContent = String(invited);
  document.querySelectorAll('.slot').forEach((slot, i) => {
    slot.classList.toggle('slot--filled', i < invited);
  });
  document.querySelector('[data-party-hint]').textContent = PARTY_HINTS[invited];
}

function setupCalc() {
  const input = document.getElementById('calc-input');
  const out = {
    n: document.querySelector('[data-calc-n]'),
    days: document.querySelector('[data-calc-days]'),
    word: document.querySelector('[data-calc-word]'),
    months: document.querySelector('[data-calc-months]'),
    friends: document.querySelector('[data-calc-friends]'),
  };
  const render = () => {
    const n = Number(input.value);
    const t = calcTexts(n);
    out.n.textContent = String(n);
    out.days.textContent = String(t.days);
    out.word.textContent = t.word;
    out.months.textContent = t.months;
    out.friends.textContent = t.friends;
  };
  input.addEventListener('input', render);
  render();
}

const { ref, invited } = readParams();
setupLink(ref);
setupParty(invited);
setupCalc();
