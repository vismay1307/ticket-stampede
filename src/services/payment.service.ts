let paymentCount = 0;

export async function processPayment(amount: number) {
  paymentCount++;

  console.log(
    `Processing payment #${paymentCount} of ₹${amount}`
  );

  await new Promise((resolve) => setTimeout(resolve, 500));

  return true;
}