//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct ClaimWinningsV2 {
      
              
          pub claimer: solana_program::pubkey::Pubkey,
          
              
          pub state: solana_program::pubkey::Pubkey,
          
              
          pub vault: solana_program::pubkey::Pubkey,
          
              
          pub user_bet: solana_program::pubkey::Pubkey,
          
              
          pub system_program: solana_program::pubkey::Pubkey,
      }

impl ClaimWinningsV2 {
  pub fn instruction(&self, args: ClaimWinningsV2InstructionArgs) -> solana_program::instruction::Instruction {
    self.instruction_with_remaining_accounts(args, &[])
  }
  #[allow(clippy::vec_init_then_push)]
  pub fn instruction_with_remaining_accounts(&self, args: ClaimWinningsV2InstructionArgs, remaining_accounts: &[solana_program::instruction::AccountMeta]) -> solana_program::instruction::Instruction {
    let mut accounts = Vec::with_capacity(5 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            self.claimer,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.state,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.vault,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.user_bet,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false
          ));
                      accounts.extend_from_slice(remaining_accounts);
    let mut data = ClaimWinningsV2InstructionData::new().try_to_vec().unwrap();
          let mut args = args.try_to_vec().unwrap();
      data.append(&mut args);
    
    solana_program::instruction::Instruction {
      program_id: crate::SANTA_VS_GRINCH_ID,
      accounts,
      data,
    }
  }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct ClaimWinningsV2InstructionData {
            discriminator: [u8; 8],
            }

impl ClaimWinningsV2InstructionData {
  pub fn new() -> Self {
    Self {
                        discriminator: [184, 77, 105, 92, 126, 80, 168, 189],
                                }
  }
}

impl Default for ClaimWinningsV2InstructionData {
  fn default() -> Self {
    Self::new()
  }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct ClaimWinningsV2InstructionArgs {
                  pub bet_tag: String,
      }


/// Instruction builder for `ClaimWinningsV2`.
///
/// ### Accounts:
///
                      ///   0. `[writable, signer]` claimer
                ///   1. `[writable]` state
                ///   2. `[writable]` vault
                ///   3. `[writable]` user_bet
                ///   4. `[optional]` system_program (default to `11111111111111111111111111111111`)
#[derive(Clone, Debug, Default)]
pub struct ClaimWinningsV2Builder {
            claimer: Option<solana_program::pubkey::Pubkey>,
                state: Option<solana_program::pubkey::Pubkey>,
                vault: Option<solana_program::pubkey::Pubkey>,
                user_bet: Option<solana_program::pubkey::Pubkey>,
                system_program: Option<solana_program::pubkey::Pubkey>,
                        bet_tag: Option<String>,
        __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl ClaimWinningsV2Builder {
  pub fn new() -> Self {
    Self::default()
  }
            #[inline(always)]
    pub fn claimer(&mut self, claimer: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.claimer = Some(claimer);
                    self
    }
            #[inline(always)]
    pub fn state(&mut self, state: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.state = Some(state);
                    self
    }
            #[inline(always)]
    pub fn vault(&mut self, vault: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.vault = Some(vault);
                    self
    }
            #[inline(always)]
    pub fn user_bet(&mut self, user_bet: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.user_bet = Some(user_bet);
                    self
    }
            /// `[optional account, default to '11111111111111111111111111111111']`
#[inline(always)]
    pub fn system_program(&mut self, system_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.system_program = Some(system_program);
                    self
    }
                    #[inline(always)]
      pub fn bet_tag(&mut self, bet_tag: String) -> &mut Self {
        self.bet_tag = Some(bet_tag);
        self
      }
        /// Add an additional account to the instruction.
  #[inline(always)]
  pub fn add_remaining_account(&mut self, account: solana_program::instruction::AccountMeta) -> &mut Self {
    self.__remaining_accounts.push(account);
    self
  }
  /// Add additional accounts to the instruction.
  #[inline(always)]
  pub fn add_remaining_accounts(&mut self, accounts: &[solana_program::instruction::AccountMeta]) -> &mut Self {
    self.__remaining_accounts.extend_from_slice(accounts);
    self
  }
  #[allow(clippy::clone_on_copy)]
  pub fn instruction(&self) -> solana_program::instruction::Instruction {
    let accounts = ClaimWinningsV2 {
                              claimer: self.claimer.expect("claimer is not set"),
                                        state: self.state.expect("state is not set"),
                                        vault: self.vault.expect("vault is not set"),
                                        user_bet: self.user_bet.expect("user_bet is not set"),
                                        system_program: self.system_program.unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
                      };
          let args = ClaimWinningsV2InstructionArgs {
                                                              bet_tag: self.bet_tag.clone().expect("bet_tag is not set"),
                                    };
    
    accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
  }
}

  /// `claim_winnings_v2` CPI accounts.
  pub struct ClaimWinningsV2CpiAccounts<'a, 'b> {
          
                    
              pub claimer: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub state: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub vault: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub user_bet: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            }

/// `claim_winnings_v2` CPI instruction.
pub struct ClaimWinningsV2Cpi<'a, 'b> {
  /// The program to invoke.
  pub __program: &'b solana_program::account_info::AccountInfo<'a>,
      
              
          pub claimer: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub state: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub vault: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub user_bet: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            /// The arguments for the instruction.
    pub __args: ClaimWinningsV2InstructionArgs,
  }

impl<'a, 'b> ClaimWinningsV2Cpi<'a, 'b> {
  pub fn new(
    program: &'b solana_program::account_info::AccountInfo<'a>,
          accounts: ClaimWinningsV2CpiAccounts<'a, 'b>,
              args: ClaimWinningsV2InstructionArgs,
      ) -> Self {
    Self {
      __program: program,
              claimer: accounts.claimer,
              state: accounts.state,
              vault: accounts.vault,
              user_bet: accounts.user_bet,
              system_program: accounts.system_program,
                    __args: args,
          }
  }
  #[inline(always)]
  pub fn invoke(&self) -> solana_program::entrypoint::ProgramResult {
    self.invoke_signed_with_remaining_accounts(&[], &[])
  }
  #[inline(always)]
  pub fn invoke_with_remaining_accounts(&self, remaining_accounts: &[(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)]) -> solana_program::entrypoint::ProgramResult {
    self.invoke_signed_with_remaining_accounts(&[], remaining_accounts)
  }
  #[inline(always)]
  pub fn invoke_signed(&self, signers_seeds: &[&[&[u8]]]) -> solana_program::entrypoint::ProgramResult {
    self.invoke_signed_with_remaining_accounts(signers_seeds, &[])
  }
  #[allow(clippy::clone_on_copy)]
  #[allow(clippy::vec_init_then_push)]
  pub fn invoke_signed_with_remaining_accounts(
    &self,
    signers_seeds: &[&[&[u8]]],
    remaining_accounts: &[(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)]
  ) -> solana_program::entrypoint::ProgramResult {
    let mut accounts = Vec::with_capacity(5 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            *self.claimer.key,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.state.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.vault.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.user_bet.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.system_program.key,
            false
          ));
                      remaining_accounts.iter().for_each(|remaining_account| {
      accounts.push(solana_program::instruction::AccountMeta {
          pubkey: *remaining_account.0.key,
          is_signer: remaining_account.1,
          is_writable: remaining_account.2,
      })
    });
    let mut data = ClaimWinningsV2InstructionData::new().try_to_vec().unwrap();
          let mut args = self.__args.try_to_vec().unwrap();
      data.append(&mut args);
    
    let instruction = solana_program::instruction::Instruction {
      program_id: crate::SANTA_VS_GRINCH_ID,
      accounts,
      data,
    };
    let mut account_infos = Vec::with_capacity(5 + 1 + remaining_accounts.len());
    account_infos.push(self.__program.clone());
                  account_infos.push(self.claimer.clone());
                        account_infos.push(self.state.clone());
                        account_infos.push(self.vault.clone());
                        account_infos.push(self.user_bet.clone());
                        account_infos.push(self.system_program.clone());
              remaining_accounts.iter().for_each(|remaining_account| account_infos.push(remaining_account.0.clone()));

    if signers_seeds.is_empty() {
      solana_program::program::invoke(&instruction, &account_infos)
    } else {
      solana_program::program::invoke_signed(&instruction, &account_infos, signers_seeds)
    }
  }
}

/// Instruction builder for `ClaimWinningsV2` via CPI.
///
/// ### Accounts:
///
                      ///   0. `[writable, signer]` claimer
                ///   1. `[writable]` state
                ///   2. `[writable]` vault
                ///   3. `[writable]` user_bet
          ///   4. `[]` system_program
#[derive(Clone, Debug)]
pub struct ClaimWinningsV2CpiBuilder<'a, 'b> {
  instruction: Box<ClaimWinningsV2CpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> ClaimWinningsV2CpiBuilder<'a, 'b> {
  pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
    let instruction = Box::new(ClaimWinningsV2CpiBuilderInstruction {
      __program: program,
              claimer: None,
              state: None,
              vault: None,
              user_bet: None,
              system_program: None,
                                            bet_tag: None,
                    __remaining_accounts: Vec::new(),
    });
    Self { instruction }
  }
      #[inline(always)]
    pub fn claimer(&mut self, claimer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.claimer = Some(claimer);
                    self
    }
      #[inline(always)]
    pub fn state(&mut self, state: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.state = Some(state);
                    self
    }
      #[inline(always)]
    pub fn vault(&mut self, vault: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.vault = Some(vault);
                    self
    }
      #[inline(always)]
    pub fn user_bet(&mut self, user_bet: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.user_bet = Some(user_bet);
                    self
    }
      #[inline(always)]
    pub fn system_program(&mut self, system_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.system_program = Some(system_program);
                    self
    }
                    #[inline(always)]
      pub fn bet_tag(&mut self, bet_tag: String) -> &mut Self {
        self.instruction.bet_tag = Some(bet_tag);
        self
      }
        /// Add an additional account to the instruction.
  #[inline(always)]
  pub fn add_remaining_account(&mut self, account: &'b solana_program::account_info::AccountInfo<'a>, is_writable: bool, is_signer: bool) -> &mut Self {
    self.instruction.__remaining_accounts.push((account, is_writable, is_signer));
    self
  }
  /// Add additional accounts to the instruction.
  ///
  /// Each account is represented by a tuple of the `AccountInfo`, a `bool` indicating whether the account is writable or not,
  /// and a `bool` indicating whether the account is a signer or not.
  #[inline(always)]
  pub fn add_remaining_accounts(&mut self, accounts: &[(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)]) -> &mut Self {
    self.instruction.__remaining_accounts.extend_from_slice(accounts);
    self
  }
  #[inline(always)]
  pub fn invoke(&self) -> solana_program::entrypoint::ProgramResult {
    self.invoke_signed(&[])
  }
  #[allow(clippy::clone_on_copy)]
  #[allow(clippy::vec_init_then_push)]
  pub fn invoke_signed(&self, signers_seeds: &[&[&[u8]]]) -> solana_program::entrypoint::ProgramResult {
          let args = ClaimWinningsV2InstructionArgs {
                                                              bet_tag: self.instruction.bet_tag.clone().expect("bet_tag is not set"),
                                    };
        let instruction = ClaimWinningsV2Cpi {
        __program: self.instruction.__program,
                  
          claimer: self.instruction.claimer.expect("claimer is not set"),
                  
          state: self.instruction.state.expect("state is not set"),
                  
          vault: self.instruction.vault.expect("vault is not set"),
                  
          user_bet: self.instruction.user_bet.expect("user_bet is not set"),
                  
          system_program: self.instruction.system_program.expect("system_program is not set"),
                          __args: args,
            };
    instruction.invoke_signed_with_remaining_accounts(signers_seeds, &self.instruction.__remaining_accounts)
  }
}

#[derive(Clone, Debug)]
struct ClaimWinningsV2CpiBuilderInstruction<'a, 'b> {
  __program: &'b solana_program::account_info::AccountInfo<'a>,
            claimer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                vault: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                user_bet: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                        bet_tag: Option<String>,
        /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
  __remaining_accounts: Vec<(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)>,
}

