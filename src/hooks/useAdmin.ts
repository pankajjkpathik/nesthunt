export function useAdminSession() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function loadSession() {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setSignedIn(false);
        setIsAdmin(false);
        setUserId(null);
        return;
      }

      const uid = session.user.id;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      setSignedIn(true);
      setUserId(uid);
      setIsAdmin(!!data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queueMicrotask(() => {
        loadSession();
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    loading,
    signedIn,
    isAdmin,
    userId,
    refresh: loadSession,
  };
}
