begin;
insert into auth.users(id) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
insert into public.member_cards(id,display_name,username,discoverable) values(auth.uid(),'A','test_core_a',true);
insert into public.content_items(id,title,category,official_url) values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','RLS test','Libros','https://example.invalid/rls-test');
insert into public.collections(id,title) values('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','Private collection');
insert into public.collection_items values('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','dddddddd-dddd-4ddd-8ddd-dddddddddddd');
insert into public.parties(id,title,category,starts_at,capacity) values('ffffffff-ffff-4fff-8fff-ffffffffffff','Two seats','Libros',now()+interval '1 day',2);
insert into public.party_messages(party_id,body) values('ffffffff-ffff-4fff-8fff-ffffffffffff','Members only');
select public.accept_policy();
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
insert into public.member_cards(id,display_name,username,discoverable) values(auth.uid(),'B','test_core_b',true);
do $$ begin
 if (select count(*) from public.collections where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')<>0 then raise exception 'Private collection leaked'; end if;
 if (select count(*) from public.collection_items where collection_id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')<>0 then raise exception 'Private collection items leaked'; end if;
 if (select count(*) from public.policy_acceptances)<>0 then raise exception 'Acceptance leaked'; end if;
 if (select count(*) from public.party_messages where party_id='ffffffff-ffff-4fff-8fff-ffffffffffff')<>0 then raise exception 'Visitor can read chat'; end if;
 if public.set_party_rsvp('ffffffff-ffff-4fff-8fff-ffffffffffff','going')<>'going' then raise exception 'Available seat denied'; end if;
 if (select count(*) from public.party_messages where party_id='ffffffff-ffff-4fff-8fff-ffffffffffff')<>1 then raise exception 'Participant cannot read chat'; end if;
 update public.parties set title='Stolen' where id='ffffffff-ffff-4fff-8fff-ffffffffffff';
 if found then raise exception 'Host ownership bypassed'; end if;
 begin
 insert into public.party_attendees(party_id,user_id,rsvp) values('ffffffff-ffff-4fff-8fff-ffffffffffff',auth.uid(),'going');
 raise exception 'Direct RSVP allowed'; exception when insufficient_privilege then null; end;
end $$;
insert into public.friendships(id,addressee_id) values('11111111-aaaa-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
update public.friendships set status='accepted' where id='11111111-aaaa-4111-8111-111111111111';
insert into public.conversations(id,member_b) values('22222222-aaaa-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.messages(conversation_id,body) values('22222222-aaaa-4222-8222-222222222222','Private message');
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
do $$ begin
 if public.set_party_rsvp('ffffffff-ffff-4fff-8fff-ffffffffffff','going')<>'waitlist' then raise exception 'Capacity exceeded'; end if;
 if (select count(*) from public.messages where conversation_id='22222222-aaaa-4222-8222-222222222222')<>0 then raise exception 'Private messages leaked'; end if;
 if (select count(*) from public.conversations where id='22222222-aaaa-4222-8222-222222222222')<>0 then raise exception 'Conversation leaked'; end if;
 begin
 insert into public.messages(conversation_id,body) values('22222222-aaaa-4222-8222-222222222222','Intrusion');
 raise exception 'Outsider sent message'; exception when insufficient_privilege then null; end;
 begin
 perform public.moderate_report(gen_random_uuid(),'remove');
 raise exception 'Non moderator escalated'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
insert into public.blocks(blocked_id) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
do $$ begin
 if (select count(*) from public.messages where conversation_id='22222222-aaaa-4222-8222-222222222222')<>0 then raise exception 'Block ignored by chat'; end if;
 if (select count(*) from public.parties where id='ffffffff-ffff-4fff-8fff-ffffffffffff')<>0 then raise exception 'Block ignored by party'; end if;
 begin
 perform public.set_party_rsvp('ffffffff-ffff-4fff-8fff-ffffffffffff','going');
 raise exception 'Blocked user joined'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
