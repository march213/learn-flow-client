import { useEffect, useState } from 'react';
import * as fcl from '@onflow/fcl';
import * as types from '@onflow/types';
import { mintNFT } from './cadence/transactions/mintNFT';
import { getTotalSupply } from './cadence/scripts/getTotalSupply';
import flowLogo from './flow-logo.png';

function App() {
  const [user, setUser] = useState({ addr: '' });

  const logIn = () => {
    fcl.authenticate();
  };

  const logOut = () => {
    fcl.unauthenticate();
  };

  const mint = async () => {
    let _totalSupply;
    try {
      _totalSupply = await fcl.query({
        cadence: `${getTotalSupply}`,
      });
    } catch (err) {
      console.log(err);
    }

    const _id = parseInt(_totalSupply) + 1;

    try {
      const transactionId = await fcl.mutate({
        cadence: `${mintNFT}`,
        args: (arg: any, t: any) => [
          arg(user.addr, types.Address), //address to which the NFT should be minted
          arg('Obstacle #' + _id.toString(), types.String), // Name
          arg('Obstacles on the blockchain', types.String), // Description
          arg('ipfs://bafybeiekwctewivvjyarrql2ehkprutohm3nal4crjsibedko5t7dbxslu/' + _id + '.png', types.String),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        limit: 99,
      });

      console.log('Minting NFT now with transaction ID', transactionId);

      const transaction = await fcl.tx(transactionId).onceSealed();

      console.log('Testnet explorer link:', `https://testnet.flowscan.org/transaction/${transactionId}`);
      console.log(transaction);

      alert('NFT minted successfully!');
    } catch (error) {
      console.log(error);

      alert('Error minting NFT, please check the console for error details!');
    }
  };

  useEffect(() => {
    // This listens to changes in the user objects
    // and updates the connected user
    fcl.currentUser().subscribe(setUser);
  }, []);

  return (
    <main className="container mx-auto px-4 py-10">
      {user && user.addr ? (
        <div className="flex justify-between items-center">
          <span className="badge badge-lg badge-success">Wallet connected!</span>
          <button className="btn" onClick={() => logOut()}>
            ❎ {'  '}
            {console.log(user.addr)}
            {user.addr.substring(0, 6)}...{user.addr.substring(user.addr.length - 4)}
          </button>
        </div>
      ) : null}

      <div className="text-center">
        <section className="flex flex-col items-center my-8">
          <img src={flowLogo} alt="flow logo" width="56px" height="56px" />
          <h1 className="text-4xl font-bold mt-12">✨Awesome NFTs on Flow ✨</h1>
        </section>

        <p className="text-lg mb-8">The easiest NFT mint experience ever!</p>
        {user && user.addr ? (
          <>
            <button className="mt-12 btn btn-lg bg-gradient-to-r from-green-400 to-blue-500" onClick={() => mint()}>
              Mint
            </button>
          </>
        ) : (
          <button className="btn" onClick={() => logIn()}>
            Log In
          </button>
        )}
      </div>
    </main>
  );
}

export default App;
