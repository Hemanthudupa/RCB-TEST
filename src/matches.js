const MATCHES = [
  {
    matchId: "RCB_BLR_1",
    title: "RCB Match 1 (Bengaluru)",
    dateTime: "TBD",
    venue: "Bengaluru",
  },
  {
    matchId: "RCB_BLR_2",
    title: "RCB Match 2 (Bengaluru)",
    dateTime: "TBD",
    venue: "Bengaluru",
  },
  {
    matchId: "RCB_BLR_3",
    title: "RCB Match 3 (Bengaluru)",
    dateTime: "TBD",
    venue: "Bengaluru",
  },
  {
    matchId: "RCB_BLR_4",
    title: "RCB Match 4 (Bengaluru)",
    dateTime: "TBD",
    venue: "Bengaluru",
  },
  {
    matchId: "RCB_BLR_5",
    title: "RCB Match 5 (Bengaluru)",
    dateTime: "TBD",
    venue: "Bengaluru",
  },
];

function matchById(matchId) {
  return MATCHES.find((m) => m.matchId === matchId) || null;
}

module.exports = { MATCHES, matchById };

