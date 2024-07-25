import torrentSearchApi, { Torrent } from 'torrent-search-api';
import { input, select } from '@inquirer/prompts';
import * as path from 'path'
import * as execa from 'execa';

const main = async () => {
  torrentSearchApi.enablePublicProviders();

  const type = await select({
    message: "What are you looking for?", choices: [{
      name: "Movies",
      value: "Movies",
    }, {
      name: "TV",
      value: "TV"
    }]
  })
  const name = await input({ message: "What would you like to watch?" })
  const torrents = await torrentSearchApi.search(name, type, 20);


  const torrent = await select({
    message: "Please choose your torrent: ", choices: torrents.map((torrent) => {
      return { name: torrent.title, value: torrent.title }
    })
  })

  const torrentToStream = torrents.find((x) => x.title === torrent);

  const magnet = await torrentSearchApi.getMagnet(torrentToStream as Torrent)
  const btih = getBtihFromMagnet(magnet)

  const execArgs = ['download', btih, '--vlc'],
    execOpts = {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit'
    };

  execa.sync('webtorrent', execArgs, execOpts)

}

const getBtihFromMagnet = (magnetLink: string) => {
  const btihPattern = /xt=urn:btih:([0-9A-Fa-f]{40,})/;
  const match = magnetLink.match(btihPattern);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}


main();
