const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...')

    // Create multiple premium tests with different characteristics
    const tests = [
      {
        title: 'CLAT Practice Test 1 - English & Legal Reasoning',
        keyTopic: 'English & Legal Reasoning',
        type: 'PAID',
        durationInMinutes: 180,
        isActive: true,
        questions: {
          create: [
            // English Section
            {
              questionNumber: 1,
              questionText: 'Choose the correct synonym for "Ubiquitous"',
              questionType: 'OPTIONS',
              optionType: 'SINGLE',
              options: ['Rare', 'Common', 'Everywhere', 'Hidden'],
              correctAnswers: ['Everywhere'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'ENGLISH',
              explanation:
                'Ubiquitous means present, appearing, or found everywhere.',
            },
            {
              questionNumber: 2,
              questionText:
                'Identify the correct meaning of the idiom: "Break a leg"',
              questionType: 'OPTIONS',
              optionType: 'SINGLE',
              options: [
                "To break someone's leg",
                'Good luck',
                'To run fast',
                'To stop working',
              ],
              correctAnswers: ['Good luck'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'ENGLISH',
              explanation:
                '"Break a leg" is a theatrical idiom meaning "good luck".',
            },
            // Legal Reasoning Section
            {
              questionNumber: 3,
              questionText: 'What is the principle of "Stare Decisis"?',
              questionType: 'OPTIONS',
              optionType: 'SINGLE',
              options: [
                'To stare at decisions',
                'Precedent-based decision making',
                'Quick decision making',
                'Legal consultation',
              ],
              correctAnswers: ['Precedent-based decision making'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'LEGAL_REASONING',
              explanation:
                'Stare Decisis means to stand by things decided, referring to precedent-based decision making.',
            },
            {
              questionNumber: 4,
              questionText:
                'What is the maximum age limit for Supreme Court judges?',
              questionType: 'OPTIONS',
              optionType: 'SINGLE',
              options: ['60 years', '62 years', '65 years', 'No age limit'],
              correctAnswers: ['65 years'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'LEGAL_REASONING',
              explanation:
                'Supreme Court judges retire at the age of 65 years.',
            },
          ],
        },
      },
      {
        title: 'CLAT Practice Test 2 - Quantitative & Logical',
        keyTopic: 'Quantitative & Logical Reasoning',
        type: 'PAID',
        durationInMinutes: 150,
        isActive: true,
        questions: {
          create: [
            // Quantitative Techniques Section
            {
              questionNumber: 1,
              questionText: 'What is 15% of 200?',
              questionType: 'INPUT',
              correctAnswers: ['30'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'QUANTITATIVE_TECHNIQUES',
              explanation: '15% of 200 = (15/100) × 200 = 30',
            },
            {
              questionNumber: 2,
              questionText:
                'If a train travels 120 km in 2 hours, what is its speed in km/h?',
              questionType: 'INPUT',
              correctAnswers: ['60'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'QUANTITATIVE_TECHNIQUES',
              explanation: 'Speed = Distance/Time = 120/2 = 60 km/h',
            },
            // Logical Reasoning Section
            {
              questionNumber: 3,
              questionText:
                'If all roses are flowers and some flowers are red, then:',
              questionType: 'OPTIONS',
              optionType: 'SINGLE',
              options: [
                'All roses are red',
                'Some roses are red',
                'No roses are red',
                'Cannot be determined',
              ],
              correctAnswers: ['Cannot be determined'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'LOGICAL_REASONING',
              explanation:
                'The conclusion cannot be determined from the given premises.',
            },
            {
              questionNumber: 4,
              questionText: 'Complete the series: 2, 6, 12, 20, ?',
              questionType: 'INPUT',
              correctAnswers: ['30'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'LOGICAL_REASONING',
              explanation:
                'The difference increases by 2: 4, 6, 8, 10. So 20 + 10 = 30',
            },
          ],
        },
      },
      {
        title: 'CLAT Practice Test 3 - GK & Current Affairs',
        keyTopic: 'GK & Current Affairs',
        type: 'PAID',
        durationInMinutes: 120,
        isActive: true,
        questions: {
          create: [
            // GK & CA Section
            {
              questionNumber: 1,
              questionText: 'Who is the current Chief Justice of India?',
              questionType: 'OPTIONS',
              optionType: 'SINGLE',
              options: [
                'Justice D.Y. Chandrachud',
                'Justice N.V. Ramana',
                'Justice U.U. Lalit',
                'Justice S.A. Bobde',
              ],
              correctAnswers: ['Justice D.Y. Chandrachud'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'GK_CA',
              explanation:
                'Justice D.Y. Chandrachud is the current Chief Justice of India.',
            },
            {
              questionNumber: 2,
              questionText: 'Which country hosted the 2024 G20 Summit?',
              questionType: 'OPTIONS',
              optionType: 'SINGLE',
              options: ['India', 'Indonesia', 'Italy', 'Brazil'],
              correctAnswers: ['India'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'GK_CA',
              explanation: 'India hosted the 2024 G20 Summit in New Delhi.',
            },
            {
              questionNumber: 3,
              questionText: 'What is the capital of Australia?',
              questionType: 'OPTIONS',
              optionType: 'SINGLE',
              options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
              correctAnswers: ['Canberra'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'GK_CA',
              explanation: 'Canberra is the capital city of Australia.',
            },
          ],
        },
      },
      {
        title: 'CLAT Practice Test 4 - Mixed Sections',
        keyTopic: 'Mixed Sections',
        type: 'PAID',
        durationInMinutes: 200,
        isActive: true,
        questions: {
          create: [
            // Comprehension Question
            {
              questionNumber: 1,
              questionText:
                'Based on the passage above, what is the main theme?',
              isComprehension: true,
              comprehension:
                'The Indian Constitution is the supreme law of India. It lays down the framework defining fundamental political principles, establishes the structure, procedures, powers, and duties of government institutions, and sets out fundamental rights, directive principles, and the duties of citizens.',
              questionType: 'OPTIONS',
              optionType: 'SINGLE',
              options: [
                'Indian politics',
                'Constitutional framework',
                'Citizen duties',
                'Government structure',
              ],
              correctAnswers: ['Constitutional framework'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'LEGAL_REASONING',
              explanation:
                'The passage primarily discusses the constitutional framework of India.',
            },
            // Table Question
            {
              questionNumber: 2,
              questionText:
                'Based on the table above, what is the total population of City A and City B?',
              isTable: true,
              tableData: [
                ['City', 'Population'],
                ['City A', '500,000'],
                ['City B', '300,000'],
              ],
              questionType: 'INPUT',
              correctAnswers: ['800000'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'QUANTITATIVE_TECHNIQUES',
              explanation: '500,000 + 300,000 = 800,000',
            },
            {
              questionNumber: 3,
              questionText: 'What is the synonym of "Eloquent"?',
              questionType: 'OPTIONS',
              optionType: 'SINGLE',
              options: ['Quiet', 'Articulate', 'Shy', 'Confused'],
              correctAnswers: ['Articulate'],
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: 'ENGLISH',
              explanation:
                'Eloquent means fluent or persuasive in speaking or writing.',
            },
          ],
        },
      },
    ]

    // Create all tests
    const createdTests = []
    for (const testData of tests) {
      const test = await prisma.test.create({
        data: testData,
      })
      createdTests.push(test)
      console.log(
        `✅ Created test: ${test.title} with ${
          test.questions?.length || 0
        } questions`
      )
      console.log(`Test ID: ${test.id}`)
    }

    // Create a paid user for testing
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'PAID',
        paidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    })

    console.log(`✅ Created test user: ${user.email}`)
    console.log(`User ID: ${user.id}`)

    console.log('\n🎯 Test data seeded successfully!')
    console.log(`\nCreated ${createdTests.length} premium tests:`)
    createdTests.forEach((test, index) => {
      console.log(
        `${index + 1}. ${test.title} (${test.questions?.length || 0} questions)`
      )
    })

    console.log('\nYou can now:')
    console.log('1. Login with test@example.com')
    console.log('2. Navigate to the paid-test page')
    console.log('3. See multiple premium tests with different characteristics')
    console.log('4. Test the premium tests dashboard functionality')
  } catch (error) {
    console.error('❌ Error seeding test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTestData()
