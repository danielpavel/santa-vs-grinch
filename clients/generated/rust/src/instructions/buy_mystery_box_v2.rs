//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct BuyMysteryBoxV2 {
      
              
          pub user: solana_program::pubkey::Pubkey,
          
              
          pub mint: solana_program::pubkey::Pubkey,
          
              
          pub state: solana_program::pubkey::Pubkey,
          
              
          pub user_bet: solana_program::pubkey::Pubkey,
          
              
          pub user_ata: solana_program::pubkey::Pubkey,
          
              
          pub token_program: solana_program::pubkey::Pubkey,
          
              
          pub associated_token_program: solana_program::pubkey::Pubkey,
          
              
          pub recent_slothashes: solana_program::pubkey::Pubkey,
          
              
          pub system_program: solana_program::pubkey::Pubkey,
      }

impl BuyMysteryBoxV2 {
  pub fn instruction(&self, args: BuyMysteryBoxV2InstructionArgs) -> solana_program::instruction::Instruction {
    self.instruction_with_remaining_accounts(args, &[])
  }
  #[allow(clippy::vec_init_then_push)]
  pub fn instruction_with_remaining_accounts(&self, args: BuyMysteryBoxV2InstructionArgs, remaining_accounts: &[solana_program::instruction::AccountMeta]) -> solana_program::instruction::Instruction {
    let mut accounts = Vec::with_capacity(9 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            self.user,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.mint,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.state,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.user_bet,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.user_ata,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.token_program,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.associated_token_program,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.recent_slothashes,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false
          ));
                      accounts.extend_from_slice(remaining_accounts);
    let mut data = BuyMysteryBoxV2InstructionData::new().try_to_vec().unwrap();
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
pub struct BuyMysteryBoxV2InstructionData {
            discriminator: [u8; 8],
                  }

impl BuyMysteryBoxV2InstructionData {
  pub fn new() -> Self {
    Self {
                        discriminator: [103, 175, 214, 250, 179, 239, 126, 113],
                                              }
  }
}

impl Default for BuyMysteryBoxV2InstructionData {
  fn default() -> Self {
    Self::new()
  }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct BuyMysteryBoxV2InstructionArgs {
                  pub amount: u64,
                pub bet_tag: String,
      }


/// Instruction builder for `BuyMysteryBoxV2`.
///
/// ### Accounts:
///
                      ///   0. `[writable, signer]` user
                ///   1. `[writable]` mint
                ///   2. `[writable]` state
                ///   3. `[writable]` user_bet
                ///   4. `[writable]` user_ata
          ///   5. `[]` token_program
                ///   6. `[optional]` associated_token_program (default to `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`)
                ///   7. `[optional]` recent_slothashes (default to `SysvarS1otHashes111111111111111111111111111`)
                ///   8. `[optional]` system_program (default to `11111111111111111111111111111111`)
#[derive(Clone, Debug, Default)]
pub struct BuyMysteryBoxV2Builder {
            user: Option<solana_program::pubkey::Pubkey>,
                mint: Option<solana_program::pubkey::Pubkey>,
                state: Option<solana_program::pubkey::Pubkey>,
                user_bet: Option<solana_program::pubkey::Pubkey>,
                user_ata: Option<solana_program::pubkey::Pubkey>,
                token_program: Option<solana_program::pubkey::Pubkey>,
                associated_token_program: Option<solana_program::pubkey::Pubkey>,
                recent_slothashes: Option<solana_program::pubkey::Pubkey>,
                system_program: Option<solana_program::pubkey::Pubkey>,
                        amount: Option<u64>,
                bet_tag: Option<String>,
        __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl BuyMysteryBoxV2Builder {
  pub fn new() -> Self {
    Self::default()
  }
            #[inline(always)]
    pub fn user(&mut self, user: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.user = Some(user);
                    self
    }
            #[inline(always)]
    pub fn mint(&mut self, mint: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.mint = Some(mint);
                    self
    }
            #[inline(always)]
    pub fn state(&mut self, state: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.state = Some(state);
                    self
    }
            #[inline(always)]
    pub fn user_bet(&mut self, user_bet: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.user_bet = Some(user_bet);
                    self
    }
            #[inline(always)]
    pub fn user_ata(&mut self, user_ata: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.user_ata = Some(user_ata);
                    self
    }
            #[inline(always)]
    pub fn token_program(&mut self, token_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.token_program = Some(token_program);
                    self
    }
            /// `[optional account, default to 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL']`
#[inline(always)]
    pub fn associated_token_program(&mut self, associated_token_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.associated_token_program = Some(associated_token_program);
                    self
    }
            /// `[optional account, default to 'SysvarS1otHashes111111111111111111111111111']`
#[inline(always)]
    pub fn recent_slothashes(&mut self, recent_slothashes: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.recent_slothashes = Some(recent_slothashes);
                    self
    }
            /// `[optional account, default to '11111111111111111111111111111111']`
#[inline(always)]
    pub fn system_program(&mut self, system_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.system_program = Some(system_program);
                    self
    }
                    #[inline(always)]
      pub fn amount(&mut self, amount: u64) -> &mut Self {
        self.amount = Some(amount);
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
    let accounts = BuyMysteryBoxV2 {
                              user: self.user.expect("user is not set"),
                                        mint: self.mint.expect("mint is not set"),
                                        state: self.state.expect("state is not set"),
                                        user_bet: self.user_bet.expect("user_bet is not set"),
                                        user_ata: self.user_ata.expect("user_ata is not set"),
                                        token_program: self.token_program.expect("token_program is not set"),
                                        associated_token_program: self.associated_token_program.unwrap_or(solana_program::pubkey!("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")),
                                        recent_slothashes: self.recent_slothashes.unwrap_or(solana_program::pubkey!("SysvarS1otHashes111111111111111111111111111")),
                                        system_program: self.system_program.unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
                      };
          let args = BuyMysteryBoxV2InstructionArgs {
                                                              amount: self.amount.clone().expect("amount is not set"),
                                                                  bet_tag: self.bet_tag.clone().expect("bet_tag is not set"),
                                    };
    
    accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
  }
}

  /// `buy_mystery_box_v2` CPI accounts.
  pub struct BuyMysteryBoxV2CpiAccounts<'a, 'b> {
          
                    
              pub user: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub mint: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub state: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub user_bet: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub user_ata: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub token_program: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub recent_slothashes: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            }

/// `buy_mystery_box_v2` CPI instruction.
pub struct BuyMysteryBoxV2Cpi<'a, 'b> {
  /// The program to invoke.
  pub __program: &'b solana_program::account_info::AccountInfo<'a>,
      
              
          pub user: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub mint: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub state: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub user_bet: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub user_ata: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub token_program: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub recent_slothashes: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            /// The arguments for the instruction.
    pub __args: BuyMysteryBoxV2InstructionArgs,
  }

impl<'a, 'b> BuyMysteryBoxV2Cpi<'a, 'b> {
  pub fn new(
    program: &'b solana_program::account_info::AccountInfo<'a>,
          accounts: BuyMysteryBoxV2CpiAccounts<'a, 'b>,
              args: BuyMysteryBoxV2InstructionArgs,
      ) -> Self {
    Self {
      __program: program,
              user: accounts.user,
              mint: accounts.mint,
              state: accounts.state,
              user_bet: accounts.user_bet,
              user_ata: accounts.user_ata,
              token_program: accounts.token_program,
              associated_token_program: accounts.associated_token_program,
              recent_slothashes: accounts.recent_slothashes,
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
    let mut accounts = Vec::with_capacity(9 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            *self.user.key,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.mint.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.state.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.user_bet.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.user_ata.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.token_program.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.associated_token_program.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.recent_slothashes.key,
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
    let mut data = BuyMysteryBoxV2InstructionData::new().try_to_vec().unwrap();
          let mut args = self.__args.try_to_vec().unwrap();
      data.append(&mut args);
    
    let instruction = solana_program::instruction::Instruction {
      program_id: crate::SANTA_VS_GRINCH_ID,
      accounts,
      data,
    };
    let mut account_infos = Vec::with_capacity(9 + 1 + remaining_accounts.len());
    account_infos.push(self.__program.clone());
                  account_infos.push(self.user.clone());
                        account_infos.push(self.mint.clone());
                        account_infos.push(self.state.clone());
                        account_infos.push(self.user_bet.clone());
                        account_infos.push(self.user_ata.clone());
                        account_infos.push(self.token_program.clone());
                        account_infos.push(self.associated_token_program.clone());
                        account_infos.push(self.recent_slothashes.clone());
                        account_infos.push(self.system_program.clone());
              remaining_accounts.iter().for_each(|remaining_account| account_infos.push(remaining_account.0.clone()));

    if signers_seeds.is_empty() {
      solana_program::program::invoke(&instruction, &account_infos)
    } else {
      solana_program::program::invoke_signed(&instruction, &account_infos, signers_seeds)
    }
  }
}

/// Instruction builder for `BuyMysteryBoxV2` via CPI.
///
/// ### Accounts:
///
                      ///   0. `[writable, signer]` user
                ///   1. `[writable]` mint
                ///   2. `[writable]` state
                ///   3. `[writable]` user_bet
                ///   4. `[writable]` user_ata
          ///   5. `[]` token_program
          ///   6. `[]` associated_token_program
          ///   7. `[]` recent_slothashes
          ///   8. `[]` system_program
#[derive(Clone, Debug)]
pub struct BuyMysteryBoxV2CpiBuilder<'a, 'b> {
  instruction: Box<BuyMysteryBoxV2CpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> BuyMysteryBoxV2CpiBuilder<'a, 'b> {
  pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
    let instruction = Box::new(BuyMysteryBoxV2CpiBuilderInstruction {
      __program: program,
              user: None,
              mint: None,
              state: None,
              user_bet: None,
              user_ata: None,
              token_program: None,
              associated_token_program: None,
              recent_slothashes: None,
              system_program: None,
                                            amount: None,
                                bet_tag: None,
                    __remaining_accounts: Vec::new(),
    });
    Self { instruction }
  }
      #[inline(always)]
    pub fn user(&mut self, user: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.user = Some(user);
                    self
    }
      #[inline(always)]
    pub fn mint(&mut self, mint: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.mint = Some(mint);
                    self
    }
      #[inline(always)]
    pub fn state(&mut self, state: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.state = Some(state);
                    self
    }
      #[inline(always)]
    pub fn user_bet(&mut self, user_bet: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.user_bet = Some(user_bet);
                    self
    }
      #[inline(always)]
    pub fn user_ata(&mut self, user_ata: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.user_ata = Some(user_ata);
                    self
    }
      #[inline(always)]
    pub fn token_program(&mut self, token_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.token_program = Some(token_program);
                    self
    }
      #[inline(always)]
    pub fn associated_token_program(&mut self, associated_token_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.associated_token_program = Some(associated_token_program);
                    self
    }
      #[inline(always)]
    pub fn recent_slothashes(&mut self, recent_slothashes: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.recent_slothashes = Some(recent_slothashes);
                    self
    }
      #[inline(always)]
    pub fn system_program(&mut self, system_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.system_program = Some(system_program);
                    self
    }
                    #[inline(always)]
      pub fn amount(&mut self, amount: u64) -> &mut Self {
        self.instruction.amount = Some(amount);
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
          let args = BuyMysteryBoxV2InstructionArgs {
                                                              amount: self.instruction.amount.clone().expect("amount is not set"),
                                                                  bet_tag: self.instruction.bet_tag.clone().expect("bet_tag is not set"),
                                    };
        let instruction = BuyMysteryBoxV2Cpi {
        __program: self.instruction.__program,
                  
          user: self.instruction.user.expect("user is not set"),
                  
          mint: self.instruction.mint.expect("mint is not set"),
                  
          state: self.instruction.state.expect("state is not set"),
                  
          user_bet: self.instruction.user_bet.expect("user_bet is not set"),
                  
          user_ata: self.instruction.user_ata.expect("user_ata is not set"),
                  
          token_program: self.instruction.token_program.expect("token_program is not set"),
                  
          associated_token_program: self.instruction.associated_token_program.expect("associated_token_program is not set"),
                  
          recent_slothashes: self.instruction.recent_slothashes.expect("recent_slothashes is not set"),
                  
          system_program: self.instruction.system_program.expect("system_program is not set"),
                          __args: args,
            };
    instruction.invoke_signed_with_remaining_accounts(signers_seeds, &self.instruction.__remaining_accounts)
  }
}

#[derive(Clone, Debug)]
struct BuyMysteryBoxV2CpiBuilderInstruction<'a, 'b> {
  __program: &'b solana_program::account_info::AccountInfo<'a>,
            user: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                mint: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                user_bet: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                user_ata: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                associated_token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                recent_slothashes: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                        amount: Option<u64>,
                bet_tag: Option<String>,
        /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
  __remaining_accounts: Vec<(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)>,
}
