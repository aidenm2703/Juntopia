drop policy parties_read on public.parties;
create policy parties_read on public.parties for select to authenticated using(host_id=(select auth.uid()) or private.can_party(id));
drop policy conversations_read on public.conversations;
create policy conversations_read on public.conversations for select to authenticated using(
 (select auth.uid()) in (member_a,member_b)
 and not private.blocked(case when member_a=(select auth.uid()) then member_b else member_a end)
);
