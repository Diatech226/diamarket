import { QuoteFlowProvider } from './QuoteFlowProvider';
import { QuoteFlowLayout } from './QuoteFlowLayout';
import { QuoteCargoForm, QuoteDetailsForm, QuoteEstimateForm, QuoteReviewForm, QuoteRouteForm, QuoteSuccessView, QuoteTransportForm } from './QuoteFlowForms';

const STEP_COMPONENTS = {
  route: QuoteRouteForm,
  transport: QuoteTransportForm,
  cargo: QuoteCargoForm,
  estimate: QuoteEstimateForm,
  details: QuoteDetailsForm,
  review: QuoteReviewForm,
  success: QuoteSuccessView,
};

export const QuoteFlowStepPage = ({ step, title }) => {
  const StepComponent = STEP_COMPONENTS[step];

  return (
    <QuoteFlowProvider>
      <QuoteFlowLayout step={step} title={title}>
        {StepComponent ? <StepComponent /> : <p>Step ready for next iterations.</p>}
      </QuoteFlowLayout>
    </QuoteFlowProvider>
  );
};
