type OptionRow = Record<string, unknown> & { id: string };

export interface VoucherAccountOption {
  id: string;
  code: string;
  name: string;
}

export interface VoucherPartyOption {
  id: string;
  name: string;
}

export interface VoucherOptions {
  accounts: VoucherAccountOption[];
  parties: VoucherPartyOption[];
}

export function voucherOptions(
  accounts: OptionRow[],
  parties: OptionRow[],
): VoucherOptions {
  return {
    accounts: accounts
      .map((account) => ({
        id: account.id,
        code: String(account.code ?? ""),
        name: String(account.name ?? ""),
      }))
      .sort((a, b) => a.code.localeCompare(b.code) || a.name.localeCompare(b.name)),
    parties: parties
      .map((party) => ({ id: party.id, name: String(party.name ?? party.id) }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
