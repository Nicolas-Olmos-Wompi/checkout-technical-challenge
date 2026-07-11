export type WompiMerchantResponse = {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
      permalink: string;
    };
    presigned_personal_data_auth: {
      acceptance_token: string;
      permalink: string;
    };
  };
};
