import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadEnvFile} from 'node:process';
import {createClient} from '@supabase/supabase-js';
import {consumeEmailLink} from '../../src/modules/auth/services/emailLinks.js';
loadEnvFile('.env.local');
const [user]=JSON.parse(readFileSync(new URL('../../../backend/.test-runtime/fixtures.json',import.meta.url),'utf8'));
const create=()=>createClient(process.env.VITE_SUPABASE_URL,process.env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const original=create(),imported=create();
try{
  const {data,error}=await original.auth.signInWithPassword({email:user.email,password:'Nueva12A'});
  if(error)throw error;
  const url=new URL('http://localhost:3000/');url.hash=new URLSearchParams({access_token:data.session.access_token,refresh_token:data.session.refresh_token,type:'recovery'}).toString();
  const result=await consumeEmailLink(imported,url.href,{projectUrl:process.env.VITE_SUPABASE_URL,appUrl:'http://localhost:3000'});
  const verified=await imported.auth.getUser();
  assert.equal(result.recovery,true);assert.equal(verified.data.user.id,user.id);
  console.log('Enlace local: sesión real recuperada en el cliente correcto sin navegar al enlace.');
}finally{await original.auth.signOut();original.realtime.disconnect();imported.realtime.disconnect();}
