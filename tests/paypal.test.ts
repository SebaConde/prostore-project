import { generateAccessToken, paypal } from "../lib/paypal";

//Test para generar el token de acceso de Paypal
test("Generar token desde paypal", async () => {
  const tokenResponse = await generateAccessToken();
  console.log(tokenResponse);
  expect(typeof tokenResponse).toBe("string");
  expect(tokenResponse.length).toBeGreaterThan(0);
});

//Test para crear orden de Paypal.
test("Crear orden de paypal", async () => {
  const token = await generateAccessToken();
  const price = 10;

  const orderResponse = await paypal.createOrder(price);
  console.log(orderResponse);

  expect(orderResponse).toHaveProperty("id");
  expect(orderResponse).toHaveProperty("status");
  expect(orderResponse.status).toBe("CREATED");
});

//Test para capturar metodo de pago con orden de prueba.
test("Simular pago de una orden", async () => {
  const orderId = "100";

  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({
      status: "COMPLETED",
    });

  const captureResponse = await paypal.capturePayment(orderId);
  expect(captureResponse).toHaveProperty("status", "COMPLETED");

  mockCapturePayment.mockRestore();
});
