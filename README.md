# Solana Tracking App

A Next.js application for tracking and managing Solana blockchain transactions and assets. This app provides a user-friendly interface for monitoring Solana activities and managing digital assets.

## Features

- Real-time transaction tracking
- Asset management
- Interactive charts and analytics
- Wallet integration
- Token metadata management

## Tech Stack

- Next.js 14
- TypeScript
- Solana Web3.js
- Anchor Framework
- Metaplex
- TailwindCSS
- Chart.js

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Solana CLI tools
- A Solana wallet (e.g., Phantom)

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd tracking-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
NEXT_PUBLIC_SOLANA_RPC_URL=your_rpc_url
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Project Structure

- `src/` - Source code
- `public/` - Static assets
- `lib.rs` - Solana program code
- `idl.ts` - Anchor IDL definitions
- `tracking_system.json` - Program configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
