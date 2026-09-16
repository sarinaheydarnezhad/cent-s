import type { Order, Product, SessionUser } from '../../src/types'

export interface PaymentProvider {
  createPayment(product: Product, user: SessionUser): Promise<Order>
}

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(product: Product, user: SessionUser): Promise<Order> {
    const shouldFail = process.env.MOCK_PAYMENT_SHOULD_FAIL === 'true'
    return {
      id: `ORD-${Date.now()}`,
      student: user.name,
      product: product.title,
      amount: product.price,
      status: shouldFail ? 'FAILED' : 'PAID',
      provider: 'MOCK',
      createdAt: new Date().toISOString(),
      demo: true,
    }
  }
}

export class PaymentService {
  private provider: PaymentProvider = new MockPaymentProvider()
  process(product: Product, user: SessionUser) { return this.provider.createPayment(product, user) }
}

// Future adapter contract: ZarinpalPaymentProvider implements PaymentProvider.
// It must create a pending order, redirect to the provider, and verify server-side on callback.
