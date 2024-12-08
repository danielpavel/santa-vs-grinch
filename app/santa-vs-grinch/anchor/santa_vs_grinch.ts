/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/santa_vs_grinch.json`.
 */
export type SantaVsGrinch = {
  "address": "BZGCW6asmdxFTxo1xNpgBPnX9Seb5oLfPDEy3QqLpPPE",
  "metadata": {
    "name": "santaVsGrinch",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyMysteryBox",
      "discriminator": [
        150,
        161,
        180,
        220,
        54,
        128,
        128,
        242
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "state.admin",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "feesVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "state"
              },
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "bettingSide"
            }
          }
        }
      ]
    },
    {
      "name": "claimWinnings",
      "discriminator": [
        161,
        215,
        24,
        59,
        14,
        236,
        242,
        221
      ],
      "accounts": [
        {
          "name": "claimer",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "state.admin",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "state"
              },
              {
                "kind": "const",
                "value": [
                  115,
                  97,
                  110,
                  116,
                  97,
                  45,
                  118,
                  115,
                  45,
                  103,
                  114,
                  105,
                  110,
                  99,
                  104
                ]
              }
            ]
          },
          "relations": [
            "state"
          ]
        },
        {
          "name": "userBet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "claimer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "state.admin",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "state"
              },
              {
                "kind": "const",
                "value": [
                  115,
                  97,
                  110,
                  116,
                  97,
                  45,
                  118,
                  115,
                  45,
                  103,
                  114,
                  105,
                  110,
                  99,
                  104
                ]
              }
            ]
          },
          "relations": [
            "state"
          ]
        },
        {
          "name": "feesVault",
          "writable": true
        },
        {
          "name": "userBet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "betSide",
          "type": {
            "defined": {
              "name": "bettingSide"
            }
          }
        }
      ]
    },
    {
      "name": "endGame",
      "discriminator": [
        224,
        135,
        245,
        99,
        67,
        175,
        121,
        252
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "state.admin",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        },
        {
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "state"
              },
              {
                "kind": "const",
                "value": [
                  115,
                  97,
                  110,
                  116,
                  97,
                  45,
                  118,
                  115,
                  45,
                  103,
                  114,
                  105,
                  110,
                  99,
                  104
                ]
              }
            ]
          }
        },
        {
          "name": "feesVault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "state"
              },
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "creators",
          "type": {
            "vec": {
              "defined": {
                "name": "creator"
              }
            }
          }
        },
        {
          "name": "maxNumCreators",
          "type": "u8"
        },
        {
          "name": "adminFeePercentageBp",
          "type": "u16"
        }
      ]
    },
    {
      "name": "withdrawFees",
      "discriminator": [
        198,
        212,
        171,
        109,
        144,
        215,
        174,
        89
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "state.admin",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "feesVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "state"
              },
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115
                ]
              }
            ]
          },
          "relations": [
            "state"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "userBet",
      "discriminator": [
        180,
        131,
        8,
        241,
        60,
        243,
        46,
        63
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidVaultDepositAccount",
      "msg": "Invalid deposit vault account"
    },
    {
      "code": 6001,
      "name": "invalidVaultWinningsAccount",
      "msg": "Invalid winnings vault account"
    },
    {
      "code": 6002,
      "name": "invalidAdmin",
      "msg": "Invalid admin"
    },
    {
      "code": 6003,
      "name": "invalidBetSide",
      "msg": "Invalid bet side"
    },
    {
      "code": 6004,
      "name": "invalidFeesVaultDepositAccount",
      "msg": "Invalid fees vault account"
    },
    {
      "code": 6005,
      "name": "invalidPercentage",
      "msg": "Invalid Percentage"
    },
    {
      "code": 6006,
      "name": "gameEnded",
      "msg": "Game has already ended"
    },
    {
      "code": 6007,
      "name": "gameNotEnded",
      "msg": "Game has not ended yet"
    },
    {
      "code": 6008,
      "name": "alreadyClaimed",
      "msg": "User has already claimed"
    },
    {
      "code": 6009,
      "name": "invalidTotalShares",
      "msg": "Invalid total shares"
    },
    {
      "code": 6010,
      "name": "tooManyCreators",
      "msg": "Too Many Creators"
    },
    {
      "code": 6011,
      "name": "invalidCreatorAddress",
      "msg": "invalidCreatorAddress"
    }
  ],
  "types": [
    {
      "name": "bettingSide",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "santa"
          },
          {
            "name": "grinch"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "adminFeePercentageBp",
            "type": "u16"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "feesVault",
            "type": "pubkey"
          },
          {
            "name": "santaPot",
            "type": "u64"
          },
          {
            "name": "grinchPot",
            "type": "u64"
          },
          {
            "name": "santaBoxes",
            "type": "u64"
          },
          {
            "name": "grinchBoxes",
            "type": "u64"
          },
          {
            "name": "gameEnded",
            "type": "bool"
          },
          {
            "name": "initializedAt",
            "type": "i64"
          },
          {
            "name": "winningSide",
            "type": {
              "option": {
                "defined": {
                  "name": "bettingSide"
                }
              }
            }
          },
          {
            "name": "creators",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "creator"
                  }
                },
                3
              ]
            }
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "feesVaultBump",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "creator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "pubkey"
          },
          {
            "name": "shareInBp",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "userBet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "bettingSide"
              }
            }
          },
          {
            "name": "claimed",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
