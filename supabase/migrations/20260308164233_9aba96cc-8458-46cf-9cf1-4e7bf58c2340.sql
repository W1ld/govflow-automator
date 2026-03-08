CREATE TRIGGER generate_spj_number_trigger
BEFORE INSERT ON public.kegiatan
FOR EACH ROW
EXECUTE FUNCTION public.generate_spj_number();