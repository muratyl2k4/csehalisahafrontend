import React from 'react';
import { ArrowLeft, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Rules = () => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        color: 'var(--text-muted)', background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: 'inherit'
                    }}
                >
                    <ArrowLeft size={20} />
                    Geri Dön
                </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{
                    display: 'inline-flex',
                    padding: '1.25rem',
                    background: 'rgba(99, 102, 241, 0.15)',
                    borderRadius: '24px',
                    marginBottom: '1.5rem',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }}>
                    <Book size={48} color="var(--primary)" />
                </div>
                <h1 style={{ marginBottom: '0.75rem', fontSize: '2.5rem', fontWeight: 800 }}>KURALLAR</h1>
                <p className="subtitle" style={{ fontSize: '1.1rem', opacity: 0.8 }}>CSE LİG Yönetmelikleri</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                {/* KADRO KURALLARI */}
                <section className="dashboard-card" style={{ padding: '1.5rem', cursor: 'default', textAlign: 'left' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '2px' }} />
                        Kadro Kuralları
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        <p style={{ fontWeight: 700, color: '#ef4444' }}>
                            Kesinlikle bütün oyuncular (kaleci harici) Akdeniz Üniversitesi Mühendislik Fakültesine ana programda kayıtlı olmalı (yandal veya çift anadal geçersiz). Dışarıdan oyuncu getiren takımlar diskalifiye edilecek ve bütün oynadıkları veya oynayacakları maçlar 5-0 hükmen mağlup sayılacaktır.
                        </p>
                        <p>
                            Takımlar en az 7 en fazla 12 kişi şeklinde kurulacaktır. Oyuncular başka takımlarda oynayamaz. Maç günü eksik çıkması durumunda oyuncular kadrolarına kayıtlı olmayan oyuncuları getiremezler. Ancak kabul ederlerse maça eksik çıkabilirler. Maça çıkmamaları durumunda hükmen 5-0 mağlup sayılacaklar.
                        </p>
                        <p>
                            Her takımın birinci ve ikinci kaptanı olacak, oynanacak her maça kaptanlardan en az bir tanesinin gelmesi zorunludur.
                        </p>
                        <p>
                            Kadro için oyuncu değişikliği veya eklemesi 6. hafta itibariyle sona erecektir.
                        </p>
                        <p>
                            Bir takımdan başka bir takıma giden bir kişi bir daha transfer olamaz.
                        </p>
                    </div>
                </section>

                {/* MAÇ KURALLARI */}
                <section className="dashboard-card" style={{ padding: '1.5rem', cursor: 'default', textAlign: 'left' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '2px' }} />
                        Maç Kuralları
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        <p>• Maçlar halı sahada 7v7 olacak şeklinde 1 saat oynanacaktır. Herkes kendi ücretini ödemekle yükümlüdür. Ligin şu an için herhangi bir saha ile anlaşması yoktur.</p>
                        <p>• Maçlarda ofsayt hariç bütün futbol kuralları geçerlidir. Ceza kartları ile ilgili düzenlemeler aşağıda verilmiştir.</p>
                        <p>• Geri pas penaltıya sebebiyet verir.</p>
                        <p>• Topun oyun alanının dışına çıkmış sayılması için tele değip değmemesine karar vermek oynanan sahaya göre değişeceği için ilgili kararı maç başında hakem alır ve oyunculara duyurur.</p>
                        <p>• Maçlardan önce her iki takım kaptanın ortak kararıyla turnuvadaki farklı bir takımda oynayan bir oyuncu orta hakem, başka bir oyuncu ise yan hakem olarak belirlenecektir.</p>
                        <p>• Maç saatinden itibaren 10 dakika içerisinde sahaya çıkmayan takım 3-0 mağlup sayılır, 15 dakika içerisinde sahaya çıkmayan takım 5-0 hükmen mağlup sayılır. Süre takibi ve karar hakem tarafından verilir.</p>
                        <p>• Aşırı yağmur, sahanın oynanamaz hale gelmesi veya oyuncu güvenliğini tehlikeye atan durumlarda maç, hakem ve her iki takım kaptanının ortak kararı ile ertelenebilir. Tek taraflı erteleme talebi geçersizdir.</p>
                        <p>• Maçta ceza veya eksik sebebiyle bir takım maçın geri kalanını 5 kişiden daha az kişiyle oynamak zorunda kalırsa maçın mevcut skoruna bakılmaksızın hükmen 5-0 mağlup sayılır. Geçici kırmızı kart cezası sebebiyle 5 kişiden az kişiyle oynamak sorun teşkil etmez.</p>
                        <p>• Maç içinde en fazla 3 oyuncu değişiklik hakkı vardır. Çıkan oyuncu maça yeniden giremez.</p>
                        <p style={{ fontWeight: 700, color: 'var(--primary)' }}>• Maç içinde hakemin sözünün üstüne söz söylemek yasaktır. Sahadaki en büyük otorite hakemdir.</p>
                    </div>
                </section>

                {/* CEZALAR HAKKINDA */}
                <section className="dashboard-card" style={{ padding: '1.5rem', cursor: 'default', textAlign: 'left', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '4px', height: '24px', background: '#ef4444', borderRadius: '2px' }} />
                        Cezalar Hakkında
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                            Maçların kendi aramızda dostane bir şekilde olmasını istiyoruz, Fair-Play’i ön planda tutarak çekişmeli ve zevkli maçlar yapmak birinci amacımızdır.
                        </p>
                        <p style={{ fontWeight: 600 }}>
                            Çirkefçe oynamayı, bilerek faul yapmayı, hakemle sürekli münakaşaya girmeyi, küfürlü ve saldırgan bir dilde konuşmayı, hakem olduğu maçlarda taraf tutmayı alışkanlık haline getiren oyuncular takımlarıyla beraber ligten diskalifiye edilecektir.
                        </p>
                        <p>
                            Hakeme küfür eden oyuncu en az 2 maç men cezası alır. Fiziksel kavga, saldırı veya tehdit durumlarında oyuncu ligten ihraç edilebilir. Takım halinde kavga veya sahayı karıştırma durumunda takım diskalifiye edilebilir.
                        </p>
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <span style={{ color: '#fbbf24', fontWeight: 900 }}>[!]</span>
                                <span>Aynı maç içerisinde görülen iki sarı kart kırmızı karta sebebiyet verir. Sarı kartlar birikir ve 5. sarı kartı gören oyuncu bir sonraki maçı kaçırır.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <span style={{ color: '#ef4444', fontWeight: 900 }}>[!]</span>
                                <span>Aynı maç içerisinde ilk kırmızı kartını gören kişi (iki sarı veya direkt kırmızı fark etmez) 5 dakika saha kenarında bekletilir ve maça devam edemez. İkinci kırmızı kartı yerse maçın kalanına devam edemez.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <span style={{ color: '#ef4444', fontWeight: 900 }}>[!]</span>
                                <span>Aynı maç içinde iki kez kırmızı kart gören oyuncu bir sonraki maçta oynayamaz.</span>
                            </div>
                        </div>
                        <p>
                            Bilerek kırmızı kart görme, sahayı terk etme veya maçı sabote etmeye yönelik davranışlarda bulunan oyuncu veya takım disiplin cezası alır. Gerekli görülmesi halinde maç hükmen mağlubiyetle sonuçlandırılabilir.
                        </p>
                        <p style={{ fontWeight: 800, textAlign: 'center', marginTop: '1rem', color: '#ef4444', textDecoration: 'underline' }}>
                            Çok sert fauller, kavgalar veya küfürleşmeler maç sonrası ek cezaya sebep olabilir.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Rules;
