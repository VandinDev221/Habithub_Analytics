/**
 * Segredo JWT único para assinar e verificar tokens.
 * Usado pelo authController (login) e authMiddleware (verificação).
 */
export const JWT_SECRET =
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
export const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? '7d';
