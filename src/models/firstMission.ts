// CONTRACTS

export interface ContractDeliver {
  tradeSymbol: string;
  destinationSymbol: string;
  unitsRequired: number;
  unitsFulfilled: number;
}

interface ContractPayment {
  onAccepted: number;
  onFulfilled: number;
}

interface ContractTerms {
  deadline: string | Date;
  payment: ContractPayment;
  deliver: ContractDeliver[];
}

export interface Contract {
  id: string;
  factionSymbol: string;
  type: string;
  terms: ContractTerms;
  accepted: boolean;
  fulfilled: boolean;
  expiration: string | Date;
  deadlineToAccept: string | Date;
}