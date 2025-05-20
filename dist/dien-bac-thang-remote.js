class DienBacThangRemoteCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) throw new Error("Cần cấu hình 'entity'.");
    this._config = config;
  }

  async set hass(hass) {
    const entity = this._config.entity;
    const title = this._config.name || 'Tiền điện';
    const shortFormat = this._config.short || false;
    const json_url = 'https://bachtran.net/ha/evn.json';

    let data = {};
    try {
      const res = await fetch(json_url);
      data = await res.json();
    } catch (e) {
      this.innerHTML = `<ha-card><div style="padding:16px;color:red;">❌ Không thể tải giá điện.</div></ha-card>`;
      return;
    }

    const number = parseFloat(hass.states[entity]?.state || 0);
    const tiers = [50, 50, 100, 100, 100]; // bậc 1-5
    const rates = [data.b1, data.b2, data.b3, data.b4, data.b5, data.b6];
    let remaining = number;
    let total = 0;

    for (let i = 0; i < tiers.length && remaining > 0; i++) {
      const used = Math.min(remaining, tiers[i]);
      total += used * rates[i];
      remaining -= used;
    }
    if (remaining > 0) {
      total += remaining * rates[5];
    }

    const total_vat = Math.round(total * 1.08);
    const display = shortFormat ? this._shortNumber(total_vat) : total_vat.toLocaleString('vi-VN');

    this.innerHTML = `
      <ha-card header="${title}">
        <div style="padding: 16px; font-size: 26px; font-weight: bold; text-align: center;">
          ${display} ₫
        </div>
      </ha-card>
    `;
  }

  _shortNumber(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('dien-bac-thang-remote-card', DienBacThangRemoteCard);
