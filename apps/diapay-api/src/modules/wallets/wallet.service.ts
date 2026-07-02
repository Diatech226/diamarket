import { walletRepository } from './wallet.repository';
export const walletService = { listWallets: () => walletRepository.list(), getWallet: (id: string) => walletRepository.get(id) };
