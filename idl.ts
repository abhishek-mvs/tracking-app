/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tracking_system.json`.
 */
export type TrackingSystem = {
  "address": "FfjNyygvYw56Qaq1MUj34U3nMb3uVb5NjCUjjRzMashR",
  "metadata": {
    "name": "trackingSystem",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addTrackingData",
      "discriminator": [
        245,
        9,
        69,
        127,
        229,
        81,
        79,
        38
      ],
      "accounts": [
        {
          "name": "trackingData",
          "writable": true
        },
        {
          "name": "tracker",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  107,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "tracker.title",
                "account": "tracker"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "trackerStats",
          "writable": true
        },
        {
          "name": "trackerStatsList",
          "writable": true
        },
        {
          "name": "trackerStreak",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "trackerId",
          "type": "u32"
        },
        {
          "name": "count",
          "type": "u32"
        },
        {
          "name": "date",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createTracker",
      "discriminator": [
        215,
        215,
        75,
        211,
        37,
        209,
        139,
        178
      ],
      "accounts": [
        {
          "name": "tracker",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  107,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "title"
              }
            ]
          }
        },
        {
          "name": "trackerRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  107,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "getAllTrackerStats",
      "discriminator": [
        243,
        61,
        140,
        134,
        128,
        198,
        38,
        41
      ],
      "accounts": [
        {
          "name": "trackerStatsList"
        }
      ],
      "args": [
        {
          "name": "trackerId",
          "type": "u32"
        }
      ],
      "returns": {
        "vec": {
          "defined": {
            "name": "trackerStatsAccount"
          }
        }
      }
    },
    {
      "name": "getAllTrackers",
      "discriminator": [
        75,
        221,
        12,
        181,
        120,
        80,
        250,
        86
      ],
      "accounts": [
        {
          "name": "trackerRegistry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  107,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        }
      ],
      "args": [],
      "returns": {
        "vec": "string"
      }
    },
    {
      "name": "getTrackerStats",
      "discriminator": [
        104,
        211,
        121,
        187,
        132,
        160,
        87,
        38
      ],
      "accounts": [
        {
          "name": "trackerStats"
        },
        {
          "name": "tracker",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  107,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "tracker.title",
                "account": "tracker"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "trackerId",
          "type": "u32"
        },
        {
          "name": "date",
          "type": "u64"
        }
      ],
      "returns": {
        "defined": {
          "name": "trackerStats"
        }
      }
    },
    {
      "name": "getUserStreak",
      "discriminator": [
        57,
        211,
        217,
        204,
        181,
        235,
        175,
        229
      ],
      "accounts": [
        {
          "name": "trackerStreak"
        },
        {
          "name": "user"
        }
      ],
      "args": [
        {
          "name": "trackerId",
          "type": "u32"
        }
      ],
      "returns": {
        "defined": {
          "name": "trackerStreakAccount"
        }
      }
    },
    {
      "name": "getUserTrackingData",
      "discriminator": [
        156,
        34,
        4,
        229,
        42,
        197,
        159,
        114
      ],
      "accounts": [
        {
          "name": "trackingData"
        },
        {
          "name": "user"
        }
      ],
      "args": [
        {
          "name": "trackerId",
          "type": "u32"
        }
      ],
      "returns": {
        "vec": {
          "defined": {
            "name": "track"
          }
        }
      }
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
          "name": "trackerRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  107,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
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
      "name": "tracker",
      "discriminator": [
        31,
        18,
        229,
        12,
        35,
        100,
        128,
        68
      ]
    },
    {
      "name": "trackerRegistry",
      "discriminator": [
        159,
        186,
        240,
        91,
        96,
        144,
        22,
        93
      ]
    },
    {
      "name": "trackerStatsAccount",
      "discriminator": [
        211,
        105,
        147,
        101,
        227,
        89,
        70,
        177
      ]
    },
    {
      "name": "trackerStatsList",
      "discriminator": [
        84,
        159,
        24,
        203,
        64,
        174,
        187,
        120
      ]
    },
    {
      "name": "trackerStreakAccount",
      "discriminator": [
        44,
        153,
        238,
        167,
        143,
        213,
        226,
        246
      ]
    },
    {
      "name": "trackingData",
      "discriminator": [
        41,
        41,
        30,
        249,
        160,
        90,
        55,
        187
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidTrackerId",
      "msg": "Invalid tracker ID"
    },
    {
      "code": 6001,
      "name": "trackingDataAlreadyExists",
      "msg": "Tracking data already exists for this date"
    }
  ],
  "types": [
    {
      "name": "track",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "date",
            "type": "u64"
          },
          {
            "name": "count",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "tracker",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "trackerRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "trackerNames",
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    },
    {
      "name": "trackerStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalCount",
            "type": "u32"
          },
          {
            "name": "uniqueUsers",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "trackerStatsAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "trackerId",
            "type": "u32"
          },
          {
            "name": "date",
            "type": "u64"
          },
          {
            "name": "totalCount",
            "type": "u32"
          },
          {
            "name": "uniqueUsers",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "trackerStatsList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "trackerId",
            "type": "u32"
          },
          {
            "name": "stats",
            "type": {
              "vec": {
                "defined": {
                  "name": "trackerStatsAccount"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "trackerStreakAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "trackerId",
            "type": "u32"
          },
          {
            "name": "streak",
            "type": "u32"
          },
          {
            "name": "lastStreakDate",
            "type": "u64"
          },
          {
            "name": "longestStreak",
            "type": "u32"
          },
          {
            "name": "longestStreakDate",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "trackingData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "trackerId",
            "type": "u32"
          },
          {
            "name": "tracks",
            "type": {
              "vec": {
                "defined": {
                  "name": "track"
                }
              }
            }
          }
        ]
      }
    }
  ]
};
