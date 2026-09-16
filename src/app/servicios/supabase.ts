import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environments';

@Injectable({ providedIn: 'root' })
export class Supabase {
  supabase: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
}