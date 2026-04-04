"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import syrianLogo from "@/assets/images/syrian-logo.svg";
import syrianBackground from "@/assets/images/syrian-bg-logo.svg";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/hooks/http/useAuth";
import {
  createLoginSchema,
  LoginFormData,
} from "@/lib/validations/auth.schema";

export default function Home() {
  const t = useTranslations("login");
  const tValidation = useTranslations("validation");
  const { loginMutate, loginPending, loginError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(tValidation)),
    defaultValues: {
      username: "admin",
      password: "Admin123",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutate(data);
  };

  return (
    <div className="flex min-h-screen min-w-screen bg-white/90 ">
      <div className="flex justify-center min-w-full lg:justify-between items-center">
        <div className="relative hidden w-full lg:flex items-center justify-center h-full px-4 xl:px-10 overflow-hidden shadow-xl shadow-gray-400">
          <div
            className="absolute inset-0 bg-repeat bg-contain bg-center rtl:scale-x-[-1]"
            style={{
              backgroundImage: `linear-gradient(to bottom right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.85)), url(${syrianBackground.src})`,
            }}
          />
          <div className="w-full h-full justify-center absolute bg-wheat opacity-5 z-10"></div>
          <div className="relative flex gap-3 justify-center items-center w-full h-[500px] z-20">
            <div>
              <Image
                src={syrianLogo}
                alt="Login Hero"
                className="w-[120px] xl:w-[10vw] rtl:scale-x-[-1] drop-shadow-md"
              />
            </div>
            <div className="flex flex-col justify-center items-start text-start h-[500px] drop-shadow-sm">
              <div className="text-[2vw] rtl:text-[2.5vw]">{t("ministry")}</div>
              <div className="text-[1.6vw] rtl:text-[2vw] mb-1 ">
                {t("hospital")}
              </div>
              <div className="text-[1.25vw] rtl:text-[1.2vw] ">
                {t("department")}
              </div>
            </div>
          </div>
        </div>
        <div className=" w-full lg:min-w-[600px] lg:max-w-[600px] h-full flex items-center justify-center">
          <div className="w-full sm:w-[470px] h-[600px] p-1 sm:bg-forest flex items-center justify-center sm:ring-1 ring-offset-8  rounded-md sm:ring-forest-deep">
            <div className="w-full sm:w-[420px] relative bg-white px-10 h-[550px] rounded-lg flex flex-col items-start justify-center sm:shadow-lg sm:shadow-black">
              {/* Inner shadow for page curl effect */}
              <div
                className="hidden sm:absolute sm:block inset-0 rounded-md rtl:scale-x-[-1] sm:shadow-inner-custom pointer-events-none "
                style={{
                  boxShadow:
                    "inset -4px 0 8px rgba(0,0,0,0.3), inset 2px 0 6px rgba(255,255,255,0.3)",
                }}
              />

              {/* Corner decorations */}
              <div className="hidden sm:absolute sm:block top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-wheat-dark rounded-tl-sm" />
              <div className="hidden sm:absolute sm:block top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-wheat-dark rounded-tr-sm" />
              <div className="hidden sm:absolute sm:block bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-wheat-dark rounded-bl-sm" />
              <div className="hidden sm:absolute sm:block bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-wheat-dark rounded-br-sm" />

              {/* Label holder with embossed effect */}
              <div
                className="hidden sm:block sm:absolute w-[140px] h-12 ltr:right-0 rtl:left-0 rtl:scale-x-[-1]  top-10 shadow-lg shadow-black/50 bg-gradient-to-r from-wheat via-wheat   to-wheat/90 rounded-md rounded-l-full border border-forest-deep/20"
                style={{
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 2px forest-deep",
                }}
              />

              <button className="hidden sm:block sm:absolute w-8 h-8 rounded-full bg-wheat-light ltr:right-[99px] rtl:left-[99px] shadow-sm shadow-black top-[47px] active:scale-90 transition-all" />

              <div className="hidden sm:absolute sm:block w-3 bg-wheat-dark rounded-md h-1/4 shadow-2xl ltr:-left-2 rtl:-right-2 top-10" />
              <div className="hidden sm:absolute sm:block w-3 bg-white h-1/4 ltr:left-0 rtl:right-0 top-10" />

              <div className="hidden sm:absolute sm:block w-3 bg-wheat-dark rounded-md h-1/4 ltr:-left-2 rtl:-right-2 bottom-10" />
              <div className="hidden sm:absolute sm:block w-3 bg-white h-1/4 ltr:left-0 rtl:right-0 bottom-10" />

              <div className="hidden sm:block absolute inset-0 -z-0 border-t-4 border-wheat border-dashed rounded-md"></div>
              <div className="hidden sm:block absolute inset-0 -z-0 border-b-4 border-wheat border-dashed rounded-md"></div>
              <div className="hidden sm:block absolute inset-0 -z-0 ltr:border-l-[4px] rtl:border-r-[4px] border-wheat rounded-md"></div>
              <div className="hidden sm:block absolute inset-0 -z-0 ltr:border-r-4 rtl:border-l-4 border-wheat border-dashed rounded-md"></div>

              <div className="z-10">
                <div className="text-start w-full text-[20px] mb-1">
                  {t("welcome")}
                </div>
                <div className="text-[14px] text-start mb-5">
                  {t("description")}
                </div>
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full z-10 flex flex-col gap-5"
                noValidate
                autoComplete="off"
              >
                <div className="flex flex-col gap-3">
                  <FormField
                    label={t("username")}
                    placeholder={t("usernamePlaceholder")}
                    type="text"
                    registration={register("username")}
                    error={errors.username?.message}
                    disabled={loginPending}
                  />
                  <FormField
                    label={t("password")}
                    placeholder={t("passwordPlaceholder")}
                    type="password"
                    registration={register("password")}
                    error={errors.password?.message}
                    disabled={loginPending}
                    showPasswordToggle
                  />
                </div>
                {loginError && (
                  <div className="text-red-500 text-sm">
                    {loginError.response?.data?.message || loginError.message}
                  </div>
                )}
                <div className="w-full flex">
                  <Button fullWidth type="submit" loading={loginPending}>
                    {t("loginButton")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
