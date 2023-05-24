import { FileCursor } from './cursor.js';

test('cursor', async () => {
  const cursor = FileCursor('cursor.json', 69);
  expect(await cursor.get()).toEqual(69);

  await cursor.save(420);
  expect(await cursor.get()).toEqual(420);
});
