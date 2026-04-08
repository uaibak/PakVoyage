import { CustomTripRegistrationForm } from '@/components/custom-trip-registration-form';

export default function CustomTripRegisterPage() {
  return (
    <div className="shell py-16">
      <section className="premium-card-dark overflow-hidden px-8 py-10 md:px-12 md:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
          Custom trip registration
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl leading-[0.95] text-white md:text-7xl [font-family:var(--font-heading)]">
          Register for your generated itinerary
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100">
          Enter traveler details and identity number to register this custom route request.
        </p>
      </section>

      <section className="mt-8">
        <CustomTripRegistrationForm />
      </section>
    </div>
  );
}
