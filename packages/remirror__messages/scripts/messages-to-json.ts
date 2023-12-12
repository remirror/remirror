/* eslint-env node */

import { writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kebabCase } from '@remirror/core-helpers';
import { RemirrorMessage } from '@remirror/core-types';

import * as messageGroups from '../src';

/*
ES Module workaround for __dirname
https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
 */
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../en');

type MessagesById = Record<string, string>;

function keyById(messages: RemirrorMessage[]): MessagesById {
  const messagesById: Record<string, string> = {};

  for (const { id, message } of messages) {
    messagesById[id] = message;
  }

  return messagesById;
}

async function writeMessageFile(name: string, messages: MessagesById) {
  const fileName = path.join(OUT_DIR, `${kebabCase(name)}.json`);
  const data = JSON.stringify(messages, null, 2);
  return writeFile(fileName, `${data}\n`);
}

let allMessages: MessagesById = {};

async function run() {
  const promises = [];

  for (const [name, group] of Object.entries(messageGroups)) {
    const messages = Object.values(group);
    const messagesById = keyById(messages);

    allMessages = {
      ...allMessages,
      ...messagesById,
    };
    promises.push(writeMessageFile(name, messagesById));
  }

  promises.push(writeMessageFile('allMessages', allMessages));

  await Promise.all(promises);
}

run();
