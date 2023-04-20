type playerIdName = {
  id: number;
  name: string;
};
class RenderMsgs {
  userLink(id: string | number, name: string) {
    return `<a href="tg://user?id=${id}"><b>${name}</b></a>`;
  }

  dartsStartMsg(players: { playerA: playerIdName; playerB: playerIdName }) {
    const { playerA, playerB } = players;
    const link1 = this.userLink(playerA.id, playerA.name);
    const link2 = this.userLink(playerB.id, playerB.name);
    return `${link1} Вызывает на игру в дартс🎯${link2}`;
  }

  dartsNextRoundMsg(id: number, link: string) {
   
    return `Сейчас очередь бросать 🎯 у ${link} ЖМИ КНОПКУ`
  }
}

export default new RenderMsgs();
