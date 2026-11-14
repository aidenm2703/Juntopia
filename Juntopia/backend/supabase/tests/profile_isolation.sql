begin;
insert into auth.users(id) values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');
insert into public.profiles(id,display_name,username) values ('11111111-1111-4111-8111-111111111111','Prueba A','rls_test_a'),('22222222-2222-4222-8222-222222222222','Prueba B','rls_test_b');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 if (select count(*) from public.profiles) <> 1 then raise exception 'RLS read isolation failed'; end if;
 update public.profiles set bio='own update works' where id='11111111-1111-4111-8111-111111111111';
 if not found then raise exception 'Own update failed'; end if;
 update public.profiles set bio='cross update' where id='22222222-2222-4222-8222-222222222222';
 if found then raise exception 'Cross-user update allowed'; end if;
 begin
 insert into public.profiles(id) values ('33333333-3333-4333-8333-333333333333');
 raise exception 'Cross-user insert allowed';
 exception when insufficient_privilege then null; end;
 begin
 update public.profiles set avatar_base=6 where id='11111111-1111-4111-8111-111111111111';
 raise exception 'Invalid avatar allowed';
 exception when check_violation then null; end;
end $$;
reset role;
rollback;
