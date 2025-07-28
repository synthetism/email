/**
 * AI + Email Integration Demo - Unit Architecture v1.0.6
 * 
 * Demonstrates AI learning email capabilities and using them intelligently:
 * 1. Email unit providing tool schemas to AI
 * 2. AI using learned email capabilities with natural language
 * 3. Intelligent email composition and sending
 */

import { Email } from '../src/email-unit.js';

// Mock AI unit for demonstration (would use @synet/ai in real usage)
class MockAI {
  private learnedCapabilities = new Map<string, Function>();
  private learnedSchemas = new Map<string, any>();

  learn(contracts: any[]) {
    for (const contract of contracts) {
      for (const [cap, impl] of Object.entries(contract.capabilities)) {
        const capKey = `${contract.unitId}.${cap}`;
        this.learnedCapabilities.set(capKey, impl as Function);
      }
      
      if (contract.tools) {
        for (const [cap, schema] of Object.entries(contract.tools)) {
          const schemaKey = `${contract.unitId}.${cap}`;
          this.learnedSchemas.set(schemaKey, schema);
        }
      }
    }
  }

  schemas(): string[] {
    return Array.from(this.learnedSchemas.keys());
  }

  async execute(capability: string, ...args: unknown[]): Promise<unknown> {
    const impl = this.learnedCapabilities.get(capability);
    if (!impl) {
      throw new Error(`Unknown capability: ${capability}`);
    }
    return impl(...args);
  }

  // Mock AI call that would use learned tools
  async call(prompt: string): Promise<string> {
    console.log(`🤖 AI processing: "${prompt}"`);
    
    if (prompt.includes('send') && prompt.includes('email')) {
      console.log('🧠 AI detected email sending request...');
      console.log('📋 Available email tools:', this.schemas().join(', '));
      
      // Simulate AI using learned email capabilities
      if (prompt.includes('welcome')) {
        await this.execute('email.send', {
          to: 'user@example.com',
          from: 'support@company.com',
          subject: 'Welcome to Our Platform!',
          text: 'Welcome! We\'re excited to have you join us.',
          html: '<h1>Welcome!</h1><p>We\'re excited to have you join us.</p>'
        });
        return 'I\'ve sent a welcome email to user@example.com using the learned email capabilities!';
      }
    }
    
    if (prompt.includes('validate') && prompt.includes('email')) {
      const result = await this.execute('email.validateEmail', 'test@example.com');
      return `Email validation result: ${result}`;
    }
    
    return 'I understand you want me to work with emails, and I have the tools to do it!';
  }
}

async function aiEmailDemo() {
  console.log('📧🤖 AI + Email Integration Demo - Unit Architecture v1.0.6\n');

  // 1. Create email unit with SMTP configuration
  console.log('📧 Creating email unit...');
  const email = Email.create({
    type: 'smtp',
    options: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'demo@example.com',
        pass: 'demo-password'
      }
    }
  });

  console.log(`✅ Email unit created: ${email.whoami()}`);
  console.log(`📋 Native capabilities: ${email.capabilities().join(', ')}`);
  console.log();

  // 2. Create AI unit and demonstrate learning
  console.log('🤖 Creating AI unit and learning email capabilities...');
  const ai = new MockAI();
  
  // AI learns from email unit (including v1.0.6 tool schemas)
  ai.learn([email.teach()]);
  
  console.log('✅ AI learned email capabilities');
  console.log(`📊 Available schemas: ${ai.schemas().join(', ')}`);
  console.log();

  // 3. Demonstrate AI using learned email capabilities
  console.log('🧠 Testing AI email intelligence...\n');

  // Test 1: Email validation
  console.log('🔍 Test 1: Email validation request');
  const validationResponse = await ai.call('Can you validate the email test@example.com?');
  console.log(`💬 AI Response: ${validationResponse}\n`);

  // Test 2: Welcome email sending
  console.log('📤 Test 2: Welcome email request');
  const emailResponse = await ai.call('Send a welcome email to user@example.com');
  console.log(`💬 AI Response: ${emailResponse}\n`);

  // 4. Show direct email unit capabilities
  console.log('📧 Direct email unit capabilities:');
  
  console.log('🔍 Validating email addresses...');
  console.log(`  valid@example.com: ${email.validateEmail('valid@example.com')}`);
  console.log(`  invalid-email: ${email.validateEmail('invalid-email')}`);
  
  console.log('🔗 Testing provider connection...');
  try {
    const connectionResult = await email.checkConnection();
    console.log(`  Connection test: ${connectionResult ? '✅ Success' : '❌ Failed'}`);
  } catch (error) {
    console.log(`  Connection test: ❌ Failed (${error})`);
  }

  // 5. Demonstrate teaching contract details
  console.log('\n📚 Teaching contract analysis:');
  const contract = email.teach();
  console.log(`  Unit ID: ${contract.unitId}`);
  console.log(`  Capabilities: ${Object.keys(contract.capabilities).join(', ')}`);
  console.log(`  Tool schemas: ${Object.keys(contract.tools || {}).join(', ')}`);
  
  if (contract.tools) {
    console.log('\n🛠️  Tool schema details:');
    for (const [name, schema] of Object.entries(contract.tools)) {
      console.log(`  ${name}:`);
      console.log(`    Description: ${schema.description}`);
      console.log(`    Required params: ${schema.parameters.required?.join(', ') || 'none'}`);
    }
  }

  console.log('\n🎉 AI + Email Integration Demo Complete!');
  console.log('\nKey achievements:');
  console.log('  ✅ Email unit provides tool schemas for AI integration');
  console.log('  ✅ AI learns email capabilities with parameter validation');
  console.log('  ✅ AI can intelligently use email functions via natural language');
  console.log('  ✅ Seamless integration between Unit Architecture and AI systems');
}

// Run the demo
aiEmailDemo().catch(console.error);
