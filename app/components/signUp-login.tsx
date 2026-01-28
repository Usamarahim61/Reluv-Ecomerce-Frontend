'use client';

import { X } from 'lucide-react';
import Image from 'next/image';

export default function SignUpLogin({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-xl p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer right-6 top-3 text-gray-400 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-center">
          Join and sell pre-loved clothes with no fees
        </h2>

        {/* Social buttons */}
        <div className="mt-6 space-y-3">
          {/* Google */}
          <button className="w-full flex items-center justify-center gap-3 border rounded-md py-2 font-medium hover:bg-gray-50">
            <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
            Continue with Google
          </button>

          {/* Facebook */}
          <button className="w-full flex items-center justify-center gap-3 border rounded-md py-2 font-medium hover:bg-gray-50">
            <Image
              src="/icons/facebook.svg"
              alt="Facebook"
              width={20}
              height={20}
            />
            Continue with Facebook
          </button>

          {/* Apple */}
          <button className="w-full flex items-center justify-center gap-3 border rounded-md py-2 font-medium hover:bg-gray-50">
            <Image src="/icons/apple.svg" alt="Apple" width={20} height={20} />
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Email */}
        <button className="w-full bg-[#007782] text-white rounded-md py-2 font-medium hover:bg-[#00656f]">
          Register with email
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <span className="text-[#007782] cursor-pointer hover:underline">
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
