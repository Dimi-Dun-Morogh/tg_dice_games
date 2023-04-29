import { Player, PlayerRating } from 'db/models';

export type playerIdName = {
  id: number;
  name: string;
};
class RenderMsgs {
  public static stickers = {
    epic: 'CAACAgIAAx0CUGm1aQACB2lkQrInpjyWpm6Y-vnDKq378lhgpQAC2RkAAgbQkEmprOA-tNeEZC8E',
    failed:
      'CAACAgIAAx0CUGm1aQACB2xkQrNIMwWZU13AnB9xY1CERSDBJwAClgEAArSASiR6X6ArgMZHKC8E',
    shha: 'CAACAgIAAx0CUGm1aQACB39kQrkCx7QE3xa6q8ExvvLwMFUIEQACsQMAAnwFBxuoP-HWtbcv5i8E',
  };

  static userLink(id: string | number, name: string) {
    return `<a href="tg://user?id=${id}"><b>${name}</b></a>`;
  }

  static dartsStartMsg(playerA: playerIdName, playerB: playerIdName | string) {
    const link1 = this.userLink(playerA.id, playerA.name);
    const link2 =
      typeof playerB === 'string'
        ? playerB
        : this.userLink(playerB.id, playerB.name);
    return `${link1} Вызывает на игру в дартс🎯${link2}`;
  }

  static dartsNextRoundMsg(link: string) {
    return `Сейчас очередь бросать 🎯 у ${link} ЖМИ КНОПКУ`;
  }

  static dartsRoundResult(res: number, link: string, players: Array<Player>) {
    const header = `${link}  ВЫБРАСЫВАЕТ ${res}\n\n`;
    let footer = 'РЕЗУЛЬТАТЫ:\n';
    players.forEach((el) => (footer += `${el.userLink} - ${el.score}\n`));

    return header + footer;
  }

  static dartsWinnerMsg(pl: Player) {
    return `${pl.userLink} ВЫИГРЫВАЕТ СО СЧЕТОМ ${pl.score}`;
  }

  static ratingMsg(pr: Array<PlayerRating>) {
    let str = 'Рейтинг игроков в дартс🎯🎯🎯 в этом чате:\n';
    const sorted = [...pr].sort((a, b) => a.score - b.score);
    for (let i = 0; i < sorted.length; i++) {
      const { userLink, score } = sorted[i];
      const name = /<b>(.*?)<\/b>/.exec(userLink)?.[0]
      if (i >= 10) break;
      str += `\n${name} - ${score}`;
    }
    return str;
  }
}

export default RenderMsgs;
