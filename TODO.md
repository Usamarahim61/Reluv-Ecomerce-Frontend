# TODO (BlackboxAI)

- [ ] Update Product Detail CTA auth flow
  - [ ] In `app/products/[id]/ProductDetailClient.tsx`, when user is NOT logged in and clicks **Buy Now / Ask seller / Make an Offer**:
    - [ ] Show a small prompt asking to **Ask seller or Make offer** (as requested)
    - [ ] Open the login modal (`app/components/signUp-login.tsx` or existing auth-required modal system)
    - [ ] Ensure the clicked intent is remembered so after login the user can continue (or at minimum open login dialog)
  - [ ] Verify buttons behavior on page
  - [ ] Run `next lint` / `next build` for `Reluv-Ecomerce-Frontend`

