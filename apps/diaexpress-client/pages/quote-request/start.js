export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/quote-request/route',
      permanent: false,
    },
  };
}

const Page = () => null;

export default Page;
