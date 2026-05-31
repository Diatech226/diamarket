export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/quote-request/start',
      permanent: false,
    },
  };
}

const QuoteRequestPage = () => null;

export default QuoteRequestPage;
