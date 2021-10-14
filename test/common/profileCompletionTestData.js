/**
 * This file contains the test data for Profile completion processor service unit tests
 */

const { denisUserId } = require('./testData')

const requiredFields = ['originator', 'timestamp', 'mime-type', 'topic', 'payload.userId']
const stringFields = ['topic', 'originator', 'mime-type']

const tonyJUserId = 8547899
const thomasUserId = 40309246
const saarixxUserId = 21932422

const denisSkills = {
  'userId': 123,
  'handle': 'POSTMANE2E-denis',
  'handleLower': 'postmane2e-denis',
  'skills': {
    '286': {
      'hidden': false,
      'score': 1888,
      'sources': [
        'source1',
        'source2'
      ],
      'tagName': 'Node.js'
    },
    '311': {
      'hidden': false,
      'tagName': 'Python',
      'sources': [
        'USER_ENTERED'
      ],
      'score': 0
    }
  },
  'createdAt': 1621895619502,
  'updatedAt': 1621895619502
}

const testMethods = {
  processProfileUpdateMessage: {
    requiredFields,
    stringFields,
    positiveIntegerFields: ['payload.userId'],
    dateFields: ['timestamp'],
    testMessage: {
      'topic': 'member.action.profile.update',
      'originator': 'topcoder-member-api',
      'timestamp': '2021-10-06T13:59:38.278Z',
      'mime-type': 'application/json',
      'payload': {
        'lastName': 'last name',
        'addresses': [
          {
            'zip': '560110',
            'streetAddr1': 'GM INFINITE ECITY TOWN',
            'city': 'Bangalore',
            'stateCode': 'Karnataka',
            'type': 'HOME'
          }
        ],
        'updatedBy': 'LEyCiuOrHc7UAFoY0EAAhMulWSX7SrQ5@clients',
        'description': 'What goes around comes around',
        'homeCountryCode': 'IRL',
        'handle': 'denis',
        'otherLangName': 'en',
        'userId': 123,
        'handleLower': 'denis',
        'emailVerifyTokenDate': '2021-10-06T14:59:38.262Z',
        'tracks': [
          'DESIGN',
          'DEVELOP'
        ],
        'firstName': 'Atif Ali',
        'photoURL': 'https://topcoder-dev-media.s3.amazonaws.com/member/profile/upbeat-1575621848253.png',
        'createdAt': '2020-02-06T07:38:50.088Z',
        'createdBy': 'test1',
        'newEmailVerifyToken': '8c3c2f17-ef72-4c3d-894d-e6eefc68075d',
        'emailVerifyToken': '359aaf3b-55e3-4336-b6b0-522d0a81d24c',
        'maxRating': {
          'rating': 1000,
          'track': 'dev',
          'subTrack': 'code'
        },
        'newEmail': 'atif.siddiqui2@topcoder.com',
        'competitionCountryCode': 'IRL',
        'newEmailVerifyTokenDate': '2021-10-06T14:59:38.262Z',
        'email': 'denis@topcoder.com',
        'status': 'ACTIVE',
        'updatedAt': '2021-10-06T13:59:38.262Z'
      }
    }
  },
  processCreateOrUpdateProfileTraitMessage: {
    requiredFields: ['payload.traitId', ...requiredFields],
    stringFields: ['payload.traitId', ...stringFields],
    positiveIntegerFields: ['payload.userId'],
    dateFields: ['timestamp'],
    testMessage: {
      'topic': 'member.action.profile.trait.create',
      'originator': 'topcoder-member-api',
      'timestamp': '2021-10-06T14:02:15.568Z',
      'mime-type': 'application/json',
      'payload': {
        'categoryName': 'Education',
        'traitId': 'education',
        'traits': {
          'traitId': 'education',
          'data': [
            {
              'timePeriodTo': '2019-02-16T00:00:00.000Z',
              'major': 'Major 1',
              'timePeriodFrom': '2019-01-17T00:00:00.000Z',
              'graduated': true,
              'schoolCollegeName': 'School College Name 1'
            },
            {
              'timePeriodTo': '2020-02-29T06:30:00.000Z',
              'major': 'Major 2',
              'timePeriodFrom': '2020-02-01T06:30:00.000Z',
              'graduated': false,
              'schoolCollegeName': 'School College Name 2'
            }
          ]
        },
        'userId': denisUserId,
        'createdAt': 1633528935556,
        'createdBy': 'LEyCiuOrHc7UAFoY0EAAhMulWSX7SrQ5@clients'
      }
    }
  },
  processProfileTraitRemovalMessage: {
    requiredFields,
    stringFields,
    positiveIntegerFields: ['payload.userId'],
    dateFields: ['timestamp'],
    testMessage: {
      'topic': 'member.action.profile.trait.delete',
      'originator': 'topcoder-member-api',
      'timestamp': '2021-10-06T11:26:58.223Z',
      'mime-type': 'application/json',
      'payload': {
        'userId': 123,
        'memberProfileTraitIds': [
          'education'
        ],
        'updatedAt': '2021-10-06T11:26:58.223Z',
        'updatedBy': 'LEyCiuOrHc7UAFoY0EAAhMulWSX7SrQ5@clients'
      }
    }
  },
  processProfilePictureUploadMessage: {
    requiredFields,
    stringFields,
    positiveIntegerFields: ['payload.userId'],
    dateFields: ['timestamp'],
    testMessage: {
      'topic': 'member.action.profile.photo.update',
      'originator': 'topcoder-member-api',
      'timestamp': '2021-10-06T11:26:58.223Z',
      'mime-type': 'application/json',
      'payload': {
        'userId': denisUserId,
        'photoURL': 'https://xxx.amazonaws.com/member/profile/abacd.png',
        'updatedAt': '2021-10-11T04:53:22.048Z',
        'updatedBy': '123'
      }
    }
  }
}

const tonyJExistingTraits = [
  {
    'userId': tonyJUserId,
    'traitId': 'onboarding_checklist',
    'categoryName': 'Onboarding Checklist',
    'traits': {
      'traitId': 'onboarding_checklist',
      'data': [
        {
          'standard_terms': {
            'date': '2021-09-16T09:52:11.901Z',
            'message': 'success',
            'status': 'completed'
          },
          'profile_completed': {
            'date': 1633530594016,
            'metadata': {
              'skills': false,
              'education': false,
              'work': false,
              'bio': false,
              'profile_picture': false,
              'language': false,
              'country': false
            },
            'message': 'Profile is incomplete',
            'status': 'pending_at_user'
          }
        }
      ]
    },
    'createdAt': 1631782227459,
    'updatedAt': 1631785852398,
    'createdBy': 'XKMy68LCDT7mwKaUtl17Pgf5u2A7dXYo@clients',
    'updatedBy': 'XKMy68LCDT7mwKaUtl17Pgf5u2A7dXYo@clients'
  }
]

const thomasExistingTraits = [
  {
    'userId': thomasUserId,
    'traitId': 'onboarding_checklist',
    'categoryName': 'Onboarding Checklist',
    'traits': {
      'traitId': 'onboarding_checklist',
      'data': [
        {
          'standard_terms': {
            'date': '2021-09-16T09:52:11.901Z',
            'message': 'success',
            'status': 'completed'
          },
          'profile_completed': {
            'date': 1633530594016,
            'metadata': {
              'skills': true,
              'education': false,
              'work': false,
              'bio': false,
              'profile_picture': false,
              'language': false
            },
            'message': 'Profile is incomplete',
            'status': 'pending_at_user'
          }
        }
      ]
    },
    'createdAt': 1631782227459,
    'updatedAt': 1631785852398,
    'createdBy': 'XKMy68LCDT7mwKaUtl17Pgf5u2A7dXYo@clients',
    'updatedBy': 'XKMy68LCDT7mwKaUtl17Pgf5u2A7dXYo@clients'
  }
]

const saarixxExistingTraits = [
  {
    'userId': saarixxUserId,
    'traitId': 'onboarding_checklist',
    'categoryName': 'Onboarding Checklist',
    'traits': {
      'traitId': 'onboarding_checklist',
      'data': [
        {
          'standard_terms': {
            'date': '2021-09-16T09:52:11.901Z',
            'message': 'success',
            'status': 'completed'
          },
          'profile_completed': {
            'date': 1633530594016,
            'metadata': {
              'skills': true,
              'education': true,
              'work': true,
              'bio': true,
              'profile_picture': true,
              'language': false
            },
            'message': 'Profile is incomplete',
            'status': 'pending_at_user'
          }
        }
      ]
    },
    'createdAt': 1631782227459,
    'updatedAt': 1631785852398,
    'createdBy': 'XKMy68LCDT7mwKaUtl17Pgf5u2A7dXYo@clients',
    'updatedBy': 'XKMy68LCDT7mwKaUtl17Pgf5u2A7dXYo@clients'
  },
  {
    'userId': saarixxUserId,
    'traitId': 'education',
    'traits': {
      'traitId': 'education',
      'data': [
        {
          'University': 'Kyiv Polytechnic'
        }
      ]
    }
  },
  {
    'userId': saarixxUserId,
    'traitId': 'work',
    'traits': {
      'traitId': 'work',
      'data': [
        {
          'Topcoder': 'Software Designer'
        }
      ]
    }
  }
]

const memberDetails = {
  'userId': 40154303,
  'handle': 'upbeat',
  'handleLower': 'upbeat',
  'firstName': 'Atif Ali',
  'lastName': 'Siddiqui 12345',
  'tracks': [
    'DESIGN',
    'DEVELOP'
  ],
  'status': 'ACTIVE',
  'addresses': [
    {
      'zip': '560110',
      'streetAddr1': 'GM INFINITE ECITY TOWN',
      'city': 'Bangalore',
      'stateCode': 'Karnataka',
      'type': 'HOME'
    }
  ],
  'description': 'What goes around comes around',
  'email': 'er.atif@gmail.com',
  'homeCountryCode': 'IRL',
  'competitionCountryCode': 'IRL',
  'photoURL': 'https://topcoder-dev-media.s3.amazonaws.com/member/profile/upbeat-1575621848253.png',
  'maxRating': {
    'rating': 0,
    'track': 'DATA_SCIENCE',
    'subTrack': [
      'SRM'
    ],
    'ratingColor': '#9D9FA0'
  },
  'createdAt': 1515982240000,
  'createdBy': '40154303',
  'updatedAt': 1629632394246,
  'updatedBy': '40029484'
}

const saarixxSkills = {
  'userId': 123,
  'handle': 'skills',
  'handleLower': 'postmane2e-denis',
  'skills': {
    '286': {
      'hidden': false,
      'score': 1888,
      'sources': [
        'source1',
        'source2'
      ],
      'tagName': 'Java'
    },
    '311': {
      'hidden': false,
      'tagName': 'Python',
      'sources': [
        'USER_ENTERED'
      ],
      'score': 90
    }
  },
  'createdAt': 1621895619502,
  'updatedAt': 1621895619502
}

module.exports = {
  testMethods,
  denisSkills,
  tonyJUserId,
  tonyJExistingTraits,
  thomasUserId,
  thomasExistingTraits,
  saarixxExistingTraits,
  saarixxUserId,
  memberDetails,
  saarixxSkills
}
