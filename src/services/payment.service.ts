export async function processPayment(
  amount: number
): Promise<boolean> {
  console.log(`Processing payment of ₹${amount}`);

  // Fake payment processing
  await new Promise((resolve) =>
    setTimeout(resolve, 500)
  );

  return true;
}