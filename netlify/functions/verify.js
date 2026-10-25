const { getStore } = require("@netlify/blobs");

const VALID_CODES = [
  "0UN2QFEJR", "15JTZKFYX", "2AKKICOSS", "2MAWZEKRE", "3Z2BOXRS6",
  "4FP2M4IFB", "4SFCSXTWD", "50WXROTKW", "5DZWDQGTO", "6KGGI75UT",
  "6V56929IM", "7RQP5B3KO", "88YN4KPIE", "8A56NIPWY", "8JDOUZYOT",
  "8PY7QLVZN", "9927FZ3JV", "AEGZB0AI5", "ATL3KJP6Z", "BK6XBZCAB",
  "CGC3ESBTW", "CKM22OOOA", "DBUXOHZ0V", "DHAQT4ZMR", "FNTP9ULIU",
  "FURUG4KRH", "GE142XO0C", "HDDWH9JJT", "HT0CEUI7A", "I2QNUL98L",
  "IKJ9HPPRZ", "KPD3PQS3R", "KUKYV99BP", "L7SW0EKV9", "NXO8WGG8R",
  "O8WXINZG4", "OFYWARJK3", "PYPH55MXY", "QCU7X8ICU", "QH0EIYVZG",
  "QNQZYFA6M", "QRLFTSR0F", "QCY5PRVTY", "RFXKQE0y9", "RHXOL0B2Y",
  "SKUJSLJ1U", "SQZCQRRW9", "TOIU0NI6F", "TZ7GXEC77", "VGOZYHO2S",
  "VBIRTMY7A", "W3W1HGYEA", "XPF4ZYFND", "XXT9J8ECM", "XYJ5ZIXU3",
  "YNVBD51LM", "YQJ4LWZGT", "YE61LXKCS", "YNU00L7HN", "ZQHCGI6N4",
  "ZUJIMFIHN", "A4SWKVFYG", "ANESKS9PK", "AXC8S97SN", "BIQC9ABWD",
  "BMPRWGWR6", "BSO4UBZL9", "CHA92FZFF", "EO1LMQW6W", "FBBW8J3CU",
  "FBM678PP7", "G4GA1AQD8", "GY9UFDOOK", "HLAN1TLJB", "HQRVP2TMI",
  "HXFDMR6KF", "I5ZGPQDI8", "ILV37YZQ9", "JRU5FCB4N", "JWTTY9QSE",
  "JFHYVOG14", "K1YWRMBCJ", "K4LVQEQ04", "K6D0P06XK", "KRN0D7FAA",
  "KS0UK7WE3", "LKQSZZ8CI", "MMF3NEYMQ", "OHMI6U9EM", "OA8STWL77",
  "PBWVTD7CH", "PZUAJOT11", "Q482DYSIZ", "RYAI23O6Y", "RYZPQWM0I",
  "V1ONSLCSP", "W5BJHXUUP", "XUA74TMWG", "XAS4JALRG", "YUCEWHRO9"
];

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const cleanCode = body.code ? body.code.trim().toUpperCase() : "";

    if (!VALID_CODES.includes(cleanCode)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, message: "Nieprawidłowy kod aktywacyjny!" })
      };
    }

    const store = getStore("activation-codes");
    const codeStatus = await store.get(cleanCode, { type: "json" });

    if (codeStatus && codeStatus.used) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, message: "Ten kod został już przez kogoś wykorzystany!" })
      };
    }

    await store.setJSON(cleanCode, {
      used: true,
      usedAt: new Date().toISOString()
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: "Aktywacja powiodła się!" })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "Błąd serwera: " + error.message })
    };
  }
};