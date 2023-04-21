import { Player } from 'db/models';

export type playerIdName = {
  id: number;
  name: string;
};
class RenderMsgs {
  userLink(id: string | number, name: string) {
    return `<a href="tg://user?id=${id}"><b>${name}</b></a>`;
  }

  dartsStartMsg(playerA: playerIdName, playerB: playerIdName | string) {
    const link1 = this.userLink(playerA.id, playerA.name);
    const link2 =
      typeof playerB === 'string'
        ? playerB
        : this.userLink(playerB.id, playerB.name);
    return `${link1} Вызывает на игру в дартс🎯${link2}`;
  }

  dartsNextRoundMsg(link: string) {
    return `Сейчас очередь бросать 🎯 у ${link} ЖМИ КНОПКУ`;
  }

  dartsRoundResult(res: number, link: string, players: Array<Player>) {
    const header = `${link}  ВЫБРАСЫВАЕТ ${res}\n\n`;
    let footer = 'РЕЗУЛЬТАТЫ:\n';
    players.forEach((el) => (footer += `${el.userLink} - ${el.score}\n`));

    return header + footer;
  }

  dartsWinnerMsg(pl: Player) {
    return `${pl.userLink} ВЫИГРЫВАЕТ СО СЧЕТОМ ${pl.score}`;
  }
}

export default new RenderMsgs();
