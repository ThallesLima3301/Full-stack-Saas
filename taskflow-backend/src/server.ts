import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';

console.log('🟡 Iniciando servidor...');
console.log('🟡 Environment:', env.NODE_ENV);
console.log('🟡 Port:', env.PORT);

const PORT = env.PORT;

const startServer = async () => {
  try {
    console.log('🟡 Tentando conectar ao banco...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ ERRO:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();