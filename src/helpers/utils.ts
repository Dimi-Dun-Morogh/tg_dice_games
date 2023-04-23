export async function waiter(time: number) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, time);
  });
}
